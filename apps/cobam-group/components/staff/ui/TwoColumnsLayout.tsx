import React, { ReactNode } from "react";

interface TwoColumnsLayoutProps {
    children: ReactNode;
    reversed?: boolean;
}

export default function TwoColumnsLayout({
    children,
    reversed = false,
}: TwoColumnsLayoutProps) {
    if (!children || React.Children.count(children) !== 2) {
        return null;
    }

    const [firstChild, secondChild] = React.Children.toArray(children);

    const stickyColumn = (
        <div className="xl:sticky xl:top-6 xl:max-h-[calc(100vh-3rem)] xl:self-start xl:overflow-y-auto xl:overscroll-contain xl:pr-1">
            {reversed ? secondChild : firstChild}
        </div>
    );

    const scrollingColumn = reversed ? firstChild : secondChild;

    return (
        <div
            className={`grid gap-6 xl:items-start ${
                reversed
                    ? "xl:grid-cols-[minmax(0,1fr)_420px]"
                    : "xl:grid-cols-[420px_minmax(0,1fr)]"
            }`}
        >
            {reversed ? scrollingColumn : stickyColumn}
            {reversed ? stickyColumn : scrollingColumn}
        </div>
    );
}