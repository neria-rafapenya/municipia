package com.neria_municipio.api.infrastructure.adapter.out.storage;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class CloudinaryUploadService {
    private final Cloudinary cloudinary;
    private final String folder;
    private static final int AVATAR_MAX_SIZE = 300;

    public CloudinaryUploadService(Cloudinary cloudinary, @Value("${cloudinary.folder:}") String folder) {
        this.cloudinary = cloudinary;
        this.folder = folder;
    }

    public List<UploadedFile> upload(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            return List.of();
        }
        return files.stream().map(this::uploadSingle).toList();
    }

    public UploadedFile uploadSingle(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        Map<String, Object> params = new HashMap<>();
        if (folder != null && !folder.isBlank()) {
            params.put("folder", folder);
        }
        String contentType = file.getContentType();
        if (contentType != null && !contentType.startsWith("image/")) {
            params.put("resource_type", "raw");
        }
        try {
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), params);
            String url = (String) result.get("secure_url");
            return new UploadedFile(url, file.getOriginalFilename(), contentType);
        } catch (IOException ex) {
            throw new IllegalStateException("Cloudinary upload failed", ex);
        }
    }

    public UploadedFile uploadAvatar(MultipartFile file, String publicId) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        Map<String, Object> params = new HashMap<>();
        String avatarFolder = buildAvatarFolder();
        if (avatarFolder != null && !avatarFolder.isBlank()) {
            params.put("folder", avatarFolder);
        }
        if (publicId != null && !publicId.isBlank()) {
            params.put("public_id", publicId);
            params.put("overwrite", true);
            params.put("invalidate", true);
        }
        params.put("resource_type", "image");
        params.put(
                "transformation",
                String.format("c_limit,w_%d,h_%d,q_auto,f_auto", AVATAR_MAX_SIZE, AVATAR_MAX_SIZE)
        );
        try {
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), params);
            Object secure = result.get("secure_url");
            String url = secure != null ? secure.toString() : (String) result.get("url");
            return new UploadedFile(url, file.getOriginalFilename(), file.getContentType());
        } catch (IOException ex) {
            throw new IllegalStateException("Cloudinary upload failed", ex);
        }
    }

    private String buildAvatarFolder() {
        if (folder == null || folder.isBlank()) {
            return "avatars";
        }
        return folder + "/avatars";
    }

    public record UploadedFile(String url, String fileName, String fileType) {
    }
}
