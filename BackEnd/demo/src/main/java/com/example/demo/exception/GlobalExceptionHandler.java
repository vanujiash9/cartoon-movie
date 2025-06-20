package com.example.demo.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {
    
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(EntityNotFoundException.class)
    public ModelAndView handleEntityNotFound(EntityNotFoundException ex, HttpServletRequest request) {
        logger.error("Entity not found at {}: {}", request.getRequestURI(), ex.getMessage());
        
        ModelAndView mav = new ModelAndView("error");
        mav.addObject("status", 404);
        mav.addObject("error", "Not Found");
        mav.addObject("message", ex.getMessage() != null ? ex.getMessage() : "Requested resource not found");
        mav.addObject("timestamp", LocalDateTime.now());
        mav.addObject("path", request.getRequestURI());
        return mav;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ModelAndView handleValidationExceptions(MethodArgumentNotValidException ex, HttpServletRequest request) {
        ModelAndView mav = new ModelAndView("error");
        Map<String, String> errors = new HashMap<>();
        
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errors.put(error.getField(), error.getDefaultMessage()));
        
        mav.addObject("status", 400);
        mav.addObject("error", "Validation Failed");
        mav.addObject("message", "Input validation failed");
        mav.addObject("validationErrors", errors);
        mav.addObject("timestamp", LocalDateTime.now());
        mav.addObject("path", request.getRequestURI());
        return mav;
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ModelAndView handleDataIntegrityViolation(DataIntegrityViolationException ex, 
                                                    HttpServletRequest request,
                                                    RedirectAttributes redirectAttributes) {
        logger.error("Data integrity violation at {}: {}", request.getRequestURI(), ex.getMessage());
        
        String message;
        if (ex.getMessage().contains("Duplicate entry")) {
            message = "A record with this information already exists.";
        } else {
            message = "Data constraint violation. Please check your input.";
        }
        
        String redirectUrl = determinRedirectFromPath(request.getRequestURI());
        
        redirectAttributes.addFlashAttribute("errorMessage", message);
        redirectAttributes.addFlashAttribute("messageType", "error");
        
        if (isAjaxRequest(request)) {
            ModelAndView mav = new ModelAndView("error");
            mav.addObject("status", 400);
            mav.addObject("error", "Data Integrity Violation");
            mav.addObject("message", message);
            mav.addObject("timestamp", LocalDateTime.now());
            mav.addObject("path", request.getRequestURI());
            return mav;
        }
        
        ModelAndView mav = new ModelAndView("redirect:" + redirectUrl);
        return mav;
    }

    @ExceptionHandler(SQLException.class)
    public ModelAndView handleSQLException(SQLException ex, HttpServletRequest request) {
        logger.error("SQL exception at {}: {}", request.getRequestURI(), ex.getMessage(), ex);
        
        ModelAndView mav = new ModelAndView("error");
        mav.addObject("status", 500);
        mav.addObject("error", "Database Error");
        mav.addObject("message", "A database error occurred. Please try again later.");
        mav.addObject("timestamp", LocalDateTime.now());
        mav.addObject("path", request.getRequestURI());
        mav.addObject("developerMessage", ex.getMessage());
        return mav;
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ModelAndView handleIllegalArgument(IllegalArgumentException ex, 
                                             HttpServletRequest request,
                                             RedirectAttributes redirectAttributes) {
        logger.error("Illegal argument at {}: {}", request.getRequestURI(), ex.getMessage());
        
        String message = ex.getMessage() != null ? ex.getMessage() : "Invalid input provided";
        String redirectUrl = determinRedirectFromPath(request.getRequestURI());
        
        redirectAttributes.addFlashAttribute("errorMessage", message);
        redirectAttributes.addFlashAttribute("messageType", "error");
        
        if (isAjaxRequest(request)) {
            ModelAndView mav = new ModelAndView("error");
            mav.addObject("status", 400);
            mav.addObject("error", "Bad Request");
            mav.addObject("message", message);
            mav.addObject("timestamp", LocalDateTime.now());
            mav.addObject("path", request.getRequestURI());
            return mav;
        }
        
        ModelAndView mav = new ModelAndView("redirect:" + redirectUrl);
        return mav;
    }

    @ExceptionHandler(RuntimeException.class)
    public ModelAndView handleRuntimeException(RuntimeException ex, HttpServletRequest request) {
        logger.error("Runtime exception at {}: {}", request.getRequestURI(), ex.getMessage(), ex);
        
        ModelAndView mav = new ModelAndView("error");
        mav.addObject("status", 500);
        mav.addObject("error", "Internal Server Error");
        mav.addObject("message", "An unexpected error occurred. Please try again later.");
        mav.addObject("timestamp", LocalDateTime.now());
        mav.addObject("path", request.getRequestURI());
        mav.addObject("developerMessage", ex.getMessage());
        return mav;
    }

    @ExceptionHandler(Exception.class)
    public ModelAndView handleGenericException(Exception ex, HttpServletRequest request) {
        logger.error("Unhandled exception occurred at {}: {}", request.getRequestURI(), ex.getMessage(), ex);
        
        ModelAndView mav = new ModelAndView("error");
        mav.addObject("status", 500);
        mav.addObject("error", "Internal Server Error");
        mav.addObject("message", "An unexpected error occurred. Please contact support if the problem persists.");
        mav.addObject("timestamp", LocalDateTime.now());
        mav.addObject("path", request.getRequestURI());
        mav.addObject("developerMessage", ex.getMessage());
        return mav;
    }

    private String determinRedirectFromPath(String requestPath) {
        if (requestPath.contains("/admin/movies") || requestPath.contains("/cartoon")) {
            return "/admin/movies";
        } else if (requestPath.contains("/admin/episode")) {
            return "/admin/episodes";
        } else if (requestPath.contains("/admin/comment")) {
            return "/admin/comments";
        } else {
            return "/admin";
        }
    }

    private boolean isAjaxRequest(HttpServletRequest request) {
        String requestedWith = request.getHeader("X-Requested-With");
        return "XMLHttpRequest".equals(requestedWith) || 
               request.getHeader("Accept") != null && 
               request.getHeader("Accept").contains("application/json");
    }
}