import React from 'react';
import { cn } from '../../utils/cn';

const Textarea = React.forwardRef(({
    className,
    ...props
}, ref) => {
    return (
        <textarea
            ref={ref}
            className={cn(
                "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        />
    );
});

Textarea.displayName = "Textarea";

export { Textarea };