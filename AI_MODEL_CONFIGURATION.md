# AI Model Configuration Guide

## Overview
StudyFlow now supports both predefined and custom Google AI model configurations, allowing you to use the latest models available in Google AI Studio.

## Features

### Predefined Models
- **Gemini 1.5 Pro**: Most capable model for complex reasoning
- **Gemini 1.5 Flash**: Fast and efficient for most tasks  
- **Gemini Pro**: Balanced performance and speed
- **Gemini 1.5 Flash 8B**: Lightweight model for quick responses
- **Gemini 1.5 Pro (Latest)**: Latest Pro version with improvements
- **Gemini 1.5 Flash (Latest)**: Latest Flash version with improvements

### Custom Model Support
You can now enter any Google AI model name directly, including:
- `gemini-1.5-pro-latest`
- `gemini-1.5-flash-latest` 
- `gemini-1.5-flash-8b`
- `gemini-2.0-flash-exp`
- Any other valid model from Google AI Studio

## Configuration Steps

1. **Enable AI Features**: Toggle the "Enable AI Features" switch
2. **Enter API Key**: Get your key from [Google AI Studio](https://aistudio.google.com/app/apikey)
3. **Choose Model Type**:
   - Use predefined models from the dropdown
   - OR toggle "Use custom model name" and enter any valid model
4. **Configure Parameters**:
   - Temperature (0.0-1.0): Controls creativity vs. consistency
   - Max Tokens (512-8192): Maximum response length
5. **Test Connection**: Click "Test AI Connection" to verify setup

## Error Handling

The system provides detailed error messages for common issues:
- Invalid API key
- Incorrect model names
- Network connection problems
- API quota limits
- General configuration errors

## Validation

- Model names are validated to ensure they contain "gemini"
- API key and model name are required before testing
- Real-time feedback shows current configuration
- Test connection verifies everything works correctly

## Tips

- Visit [Google AI Studio](https://aistudio.google.com) to see all available models
- Start with predefined models if you're unsure
- Use latest versions for best performance
- Test your configuration before saving settings