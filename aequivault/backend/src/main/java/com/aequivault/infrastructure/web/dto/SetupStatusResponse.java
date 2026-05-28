package com.aequivault.infrastructure.web.dto;

public class SetupStatusResponse {
    private boolean isInitialized;

    public SetupStatusResponse() {}

    public SetupStatusResponse(boolean isInitialized) {
        this.isInitialized = isInitialized;
    }

    public boolean getIsInitialized() {
        return isInitialized;
    }

    public void setIsInitialized(boolean isInitialized) {
        this.isInitialized = isInitialized;
    }
}
