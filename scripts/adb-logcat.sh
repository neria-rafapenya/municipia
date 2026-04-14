#!/usr/bin/env bash
set -euo pipefail

PKG="${1:-}"

adb start-server >/dev/null

if [ -n "$PKG" ]; then
  PID="$(adb shell pidof -s "$PKG" 2>/dev/null | tr -d '\r' || true)"
  if [ -n "$PID" ]; then
    echo "Using package: $PKG (pid $PID)"
    echo "Press Ctrl+C to stop."
    adb logcat --pid "$PID" -v time \
      ReactNativeJS:V ReactNative:V ReactNativeJNI:V TurboModuleRegistry:V \
      AndroidRuntime:E SoLoader:V Expo:V Exponent:V *:S
    exit 0
  fi
  echo "Package '$PKG' is not running. Falling back to tag filters."
fi

echo "Press Ctrl+C to stop."
adb logcat -v time \
  ReactNativeJS:V ReactNative:V ReactNativeJNI:V TurboModuleRegistry:V \
  AndroidRuntime:E SoLoader:V Expo:V Exponent:V *:S
