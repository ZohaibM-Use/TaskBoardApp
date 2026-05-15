package edu.brooklyn.cisc3130.taskboard.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PriorityValidator implements ConstraintValidator<ValidPriority, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) return true;
        return value.equals("LOW") || value.equals("MEDIUM") || value.equals("HIGH");
    }
}