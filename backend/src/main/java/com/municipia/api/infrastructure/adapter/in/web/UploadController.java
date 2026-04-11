package com.municipia.api.infrastructure.adapter.in.web;

import com.municipia.api.application.port.out.FileStoragePort;
import com.municipia.api.infrastructure.adapter.in.web.dto.UploadResponse;
import java.io.IOException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/uploads")
public class UploadController {
    private final FileStoragePort fileStoragePort;

    public UploadController(FileStoragePort fileStoragePort) {
        this.fileStoragePort = fileStoragePort;
    }

    @PostMapping
    public ResponseEntity<UploadResponse> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", required = false) String folder
    ) throws IOException {
        FileStoragePort.UploadResult result = fileStoragePort.upload(
                file.getBytes(),
                file.getOriginalFilename(),
                folder
        );
        return ResponseEntity.ok(new UploadResponse(result.url(), result.publicId()));
    }
}
