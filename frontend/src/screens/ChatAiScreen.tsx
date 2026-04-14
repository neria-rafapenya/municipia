import React, { useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Markdown from "react-native-markdown-display";
import Screen from "../components/Screen";
import ButtonBottom from "../components/ButtonBottom";
import { colors } from "../theme/colors";
import { fontFamilies, fontSizes } from "../theme/typography";
import { ApiError, requestAuth, requestAuthStream } from "../api/http";
import { useAuth } from "../context/AuthContext";
import { createTypewriter } from "../utils/typewriter";

type Message = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

const TypingDots = () => {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    const pulse = (dot: Animated.Value) =>
      Animated.sequence([
        Animated.timing(dot, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dot, {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: true,
        }),
      ]);

    const loop = Animated.loop(
      Animated.stagger(140, [pulse(dot1), pulse(dot2), pulse(dot3)]),
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.typingDots}>
      <Animated.View style={[styles.typingDot, { opacity: dot1 }]} />
      <Animated.View style={[styles.typingDot, { opacity: dot2 }]} />
      <Animated.View style={[styles.typingDot, { opacity: dot3 }]} />
    </View>
  );
};

const ChatAiScreen = () => {
  const [input, setInput] = useState("");
  const insets = useSafeAreaInsets();
  const { token, refreshToken } = useAuth();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [inputBarHeight, setInputBarHeight] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const lastSendRef = useRef<{ text: string; at: number } | null>(null);
  const typewriterRef = useRef<ReturnType<typeof createTypewriter> | null>(
    null,
  );
  const [sendHovered, setSendHovered] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m1",
      role: "assistant",
      text: "Hola, soy el asistente del municipio. ¿En qué puedo ayudarte hoy?",
    },
  ]);
  const scrollRef = useRef<ScrollView>(null);

  React.useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const keyboardOffset = Math.max(0, keyboardHeight - insets.bottom);
  const inputSafePadding = Math.max(10, insets.bottom);
  const extraLift = 18;
  const inputBottom = keyboardOffset + inputSafePadding + extraLift;

  const scheduleScroll = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  };

  const appendMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
    scheduleScroll();
  };

  const updateMessageText = (id: string, text: string) => {
    setMessages((prev) =>
      prev.map((message) =>
        message.id === id ? { ...message, text } : message,
      ),
    );
    scheduleScroll();
  };

  const createAssistantPlaceholder = () => {
    const id = `assistant-${Date.now()}-${Math.random()}`;
    appendMessage({ id, role: "assistant", text: "" });
    return id;
  };

  const streamChat = async (
    authToken: string,
    payload: { message: string; history: { role: string; content: string }[] },
    onDelta: (delta: string) => void,
  ) => {
    const response = await requestAuthStream(authToken, "/api/chat/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new ApiError(
        response.status,
        errorBody || response.statusText || "Request failed",
        errorBody,
      );
    }

    const body = response.body as unknown as { getReader?: () => any } | null;
    if (!body?.getReader) {
      return false;
    }

    if (typeof TextDecoder === "undefined") {
      return false;
    }
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let completed = false;

    while (!completed) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";
      for (const event of events) {
        let eventName = "";
        let data = "";
        for (const line of event.split("\n")) {
          const clean = line.replace(/\r$/, "");
          if (clean.startsWith("event:")) {
            eventName = clean.slice(6).trim();
            continue;
          }
          if (clean.startsWith("data:")) {
            data += clean.slice(5).trim();
          }
        }
        if (!data) continue;
        if (data === "[DONE]") {
          completed = true;
          break;
        }
        try {
          const parsed = JSON.parse(data);
          if (eventName === "delta" || parsed.delta != null) {
            onDelta(parsed.delta ?? "");
          }
          if (eventName === "done" || parsed.done) {
            completed = true;
            break;
          }
        } catch {
          if (eventName === "delta") {
            onDelta(data);
          }
        }
      }
    }

    return true;
  };

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;
    const now = Date.now();
    const last = lastSendRef.current;
    if (last && last.text === trimmed && now - last.at < 800) {
      return;
    }
    lastSendRef.current = { text: trimmed, at: now };
    if (!token) {
      appendMessage({
        id: `assistant-${Date.now()}-${Math.random()}`,
        role: "assistant",
        text: "Necesitas iniciar sesión para usar el chat.",
      });
      return;
    }
    const history = messages.map((message) => ({
      role: message.role,
      content: message.text,
    }));
    setInput("");
    appendMessage({
      id: `user-${Date.now()}-${Math.random()}`,
      role: "user",
      text: trimmed,
    });
    const assistantId = createAssistantPlaceholder();
    const typewriter = createTypewriter(
      (nextText) => updateMessageText(assistantId, nextText),
      { charsPerSecond: 70, maxChunk: 12 },
    );
    typewriterRef.current = typewriter;
    setIsSending(true);
    try {
      const run = async (authToken: string) => {
        const payload = { message: trimmed, history };
        const streamed = await streamChat(authToken, payload, (delta) => {
          typewriter.push(delta);
        });
        if (!streamed) {
          const response = await requestAuth<{ reply: string }>(
            authToken,
            "/api/chat",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            },
          );
          typewriter.push(response.reply);
        } else {
          typewriter.flush();
        }
      };

      await run(token);
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        try {
          const refreshed = await refreshToken();
          if (refreshed) {
            await (async () => {
              const payload = { message: trimmed, history };
              const streamed = await streamChat(refreshed, payload, (delta) => {
                typewriter.push(delta);
              });
              if (!streamed) {
                const retry = await requestAuth<{ reply: string }>(
                  refreshed,
                  "/api/chat",
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  },
                );
                typewriter.push(retry.reply);
              } else {
                typewriter.flush();
              }
            })();
            return;
          }
        } catch {
          // fall through to error message
        }
        typewriter.stop();
        updateMessageText(
          assistantId,
          "Tu sesión ha caducado. Inicia sesión de nuevo.",
        );
      } else {
        typewriter.stop();
        updateMessageText(
          assistantId,
          "Ahora mismo no puedo responder. Inténtalo de nuevo en unos segundos.",
        );
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Screen title="Chat IA">
      <View style={styles.container}>
        <View style={styles.chatCard}>
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={[
              styles.chatContent,
              { paddingBottom: inputBarHeight + 18 + inputBottom },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((message) => {
              const isUser = message.role === "user";
              return (
                <View
                  key={message.id}
                  style={[
                    styles.bubble,
                    isUser ? styles.userBubble : styles.aiBubble,
                  ]}
                >
                  {isUser ? (
                    <Text style={[styles.bubbleText, styles.userText]}>
                      {message.text}
                    </Text>
                  ) : message.text ? (
                    <Markdown style={markdownStyles}>{message.text}</Markdown>
                  ) : (
                    <TypingDots />
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>

        <View style={[styles.inputBarWrap, { bottom: inputBottom }]}>
          <View
            style={styles.inputBar}
            onLayout={(event) => {
              const height = event.nativeEvent.layout.height;
              if (height && height !== inputBarHeight) {
                setInputBarHeight(height);
              }
            }}
          >
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Escribe tu consulta..."
              placeholderTextColor={colors.slate}
              style={[styles.input, Platform.OS === "web" && styles.inputWeb]}
              onSubmitEditing={
                Platform.OS === "web" ? undefined : () => handleSend(input)
              }
              onKeyPress={(event) => {
                if (Platform.OS !== "web" || isSending) return;
                if (
                  event.nativeEvent.key === "Enter" &&
                  !(event.nativeEvent as any).shiftKey
                ) {
                  handleSend(input);
                }
              }}
            />
            <Pressable
              style={styles.sendButton}
              onPress={() => handleSend(input)}
              onHoverIn={() => setSendHovered(true)}
              onHoverOut={() => setSendHovered(false)}
            >
              {({ pressed }) => (
                <ButtonBottom size={36} active={pressed} hovered={sendHovered}>
                  {isSending ? (
                    <ActivityIndicator color={colors.white} size="small" />
                  ) : (
                    <MaterialIcons
                      name="send"
                      size={14}
                      color={colors.white}
                      style={styles.sendIcon}
                    />
                  )}
                </ButtonBottom>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Screen>
  );
};

const markdownStyles = {
  body: {
    color: colors.ink,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 6,
  },
  strong: {
    fontFamily: fontFamilies.bold,
  },
  bullet_list: {
    marginBottom: 6,
  },
  ordered_list: {
    marginBottom: 6,
  },
  list_item_text: {
    color: colors.ink,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 14,
    paddingBottom: 24,
  },
  chatCard: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.strokeSoft,
    padding: 12,
  },
  chatContent: {
    gap: 10,
    paddingBottom: 10,
  },
  bubble: {
    maxWidth: "82%",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
  },
  aiBubble: {
    alignSelf: "flex-start",
    backgroundColor: colors.surfaceAlt,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: colors.brandPurple,
  },
  bubbleText: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
  },
  aiText: {
    color: colors.ink,
  },
  userText: {
    color: colors.white,
  },
  typingDots: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    paddingHorizontal: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.inkSoft,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inputBarWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    marginHorizontal: 4,
  },
  input: {
    flex: 1,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.ink,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#CCCCCC",
  },
  inputWeb: {
    outlineStyle: "solid",
    outlineWidth: 0,
    outlineColor: "transparent",
    boxShadow: "none",
  },
  sendButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  sendIcon: {
    transform: [{ rotate: "-40deg" }],
  },
});

export default ChatAiScreen;
