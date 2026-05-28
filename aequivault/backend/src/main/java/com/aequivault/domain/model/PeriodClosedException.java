package com.aequivault.domain.model;

public class PeriodClosedException extends IllegalStateException {
    public PeriodClosedException(String message) {
        super(message);
    }
}
