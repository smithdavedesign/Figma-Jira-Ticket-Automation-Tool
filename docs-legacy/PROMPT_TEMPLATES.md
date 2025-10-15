# 📝 Custom Prompt Templates

This file contains examples of custom prompts you can use in the plugin for different scenarios.

## Component Templates

### Design System Component
```
Include specific design system requirements:
- Use Material Design 3 guidelines
- Implement proper elevation and shadows
- Include all required accessibility attributes (ARIA labels, roles)
- Support dark and light themes
- Use design tokens for colors, spacing, and typography
```

### Interactive Component
```
Focus on interaction and state management:
- Include hover, focus, active, and disabled states
- Implement proper keyboard navigation
- Add loading and error states where applicable
- Include animation specifications (duration: 200ms, easing: ease-out)
- Ensure touch targets are minimum 44px for mobile
```

## Feature Templates

### Mobile-First Feature
```
Prioritize mobile experience:
- Design for mobile-first, then scale up
- Ensure touch-friendly interactions
- Consider device-specific features (haptic feedback, orientation)
- Optimize for performance on low-end devices
- Include offline functionality considerations
```

### Accessibility-First Feature
```
Emphasize accessibility compliance:
- Meet WCAG 2.1 AA standards
- Include screen reader optimizations
- Implement proper focus management
- Ensure sufficient color contrast ratios
- Support keyboard-only navigation
- Include alternative text for all visual elements
```

## Bug Fix Templates

### Performance Issue
```
Address performance-related problems:
- Identify performance bottlenecks
- Include metrics for improvement (load time, bundle size)
- Consider lazy loading opportunities
- Optimize images and assets
- Implement proper caching strategies
```

### Cross-Browser Compatibility
```
Fix browser-specific issues:
- Test across Chrome, Firefox, Safari, and Edge
- Include polyfills for older browser support
- Verify responsive behavior on different screen sizes
- Check for vendor prefix requirements
- Validate HTML and CSS compliance
```

## Page/Screen Templates

### Landing Page
```
Create marketing/promotional pages:
- Optimize for conversion and user engagement
- Include SEO considerations (meta tags, structured data)
- Implement analytics tracking
- Consider A/B testing opportunities
- Ensure fast loading times
- Include social media sharing capabilities
```

### Dashboard/Admin Interface
```
Build data-heavy interfaces:
- Implement proper data visualization
- Include filtering and sorting capabilities
- Add export functionality
- Consider real-time data updates
- Implement proper error handling for data loading
- Include bulk actions for efficiency
```

## Technical Specifications

### API Integration
```
When the design involves API calls:
- Define required API endpoints
- Specify data transformation needs
- Include error handling scenarios
- Consider loading states and pagination
- Implement proper data caching
- Add retry mechanisms for failed requests
```

### State Management
```
For complex state interactions:
- Define global vs local state requirements
- Specify state persistence needs
- Include undo/redo functionality where applicable
- Consider state synchronization across components
- Implement proper state validation
```

## Testing Requirements

### Comprehensive Testing
```
Include thorough testing requirements:
- Unit tests for all business logic
- Integration tests for API interactions
- End-to-end tests for critical user flows
- Visual regression tests for UI consistency
- Accessibility testing with screen readers
- Performance testing and metrics
```

### Cross-Platform Testing
```
For multi-platform features:
- Test on iOS and Android devices
- Verify desktop browser compatibility
- Include tablet-specific considerations
- Test with different network conditions
- Validate offline functionality
- Check for device-specific features compatibility
```

## Usage Tips

1. **Mix and Match**: Combine multiple templates for comprehensive requirements
2. **Be Specific**: Customize prompts based on your team's tech stack and standards
3. **Include Context**: Reference existing components, design systems, or style guides
4. **Version Control**: Keep track of which prompts work best for your team

## Example Combined Prompt

```
Create a design system component following Material Design 3 guidelines:
- Implement proper elevation and shadows
- Include hover, focus, active, and disabled states  
- Meet WCAG 2.1 AA accessibility standards
- Support dark and light themes using design tokens
- Include unit tests and visual regression tests
- Optimize for mobile touch interactions (44px minimum target size)
- Add proper TypeScript types and JSDoc documentation
```