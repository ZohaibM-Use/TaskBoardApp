package edu.brooklyn.cisc3130.taskboard.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = PriorityValidator.class)
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidPriority {
    String message() default "Invalid priority. Must be LOW, MEDIUM, or HIGH";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
