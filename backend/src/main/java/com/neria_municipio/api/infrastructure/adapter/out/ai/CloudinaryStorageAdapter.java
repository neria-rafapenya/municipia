package com.neria_municipio.api.infrastructure.adapter.out.ai;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.neria_municipio.api.application.port.out.FileStoragePort;
import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class CloudinaryStorageAdapter implements FileStoragePort {
    private final Cloudinary cloudinary;
    private final String defaultFolder;

    public CloudinaryStorageAdapter(
            Cloudinary cloudinary,
            @Value("${cloudinary.folder:}") String defaultFolder
    ) {
        this.cloudinary = cloudinary;
        this.defaultFolder = defaultFolder;
    }

    @Override
    public UploadResult upload(byte[] content, String filename, String folder) {
        Map<String, Object> options = new HashMap<>();
        String effectiveFolder = (folder != null && !folder.isBlank()) ? folder : defaultFolder;
        if (effectiveFolder != null && !effectiveFolder.isBlank()) {
            options.put("folder", effectiveFolder);
        }
        if (filename != null && !filename.isBlank()) {
            options.put("public_id", filename);
        }

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> result = cloudinary.uploader().upload(content, options);
            String url = (String) result.getOrDefault("secure_url", result.get("url"));
            String publicId = (String) result.get("public_id");
            return new UploadResult(url, publicId);
        } catch (Exception ex) {
            throw new IllegalArgumentException("Cloudinary upload failed", ex);
        }
    }
}
