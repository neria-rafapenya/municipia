package com.neria_municipio.api.application.port.out;

public interface FileStoragePort {
    record UploadResult(String url, String publicId) {
    }

    UploadResult upload(byte[] content, String filename, String folder);
}
