import { Container, FederatedPointerEvent } from 'pixi.js';

/**
 * Interface for event management.
 * Connects VNode event handlers to the PixiJS event system.
 */
export interface IEventManager {
    /**
     * Applies event handlers to a PixiJS instance.
     * Removes old handlers and adds new ones based on props diff.
     * @param pixiInstance The PixiJS instance to apply handlers to.
     * @param oldProps The previous props (used to identify handlers to remove).
     * @param newProps The new props (used to identify handlers to add).
     */
    applyEventHandlers(
        pixiInstance: Container,
        oldProps: Record<string, any>,
        newProps: Record<string, any>
    ): void;
}

/**
 * Implementation class for the EventManager.
 * Manages the attachment and detachment of event handlers defined in VNode props
 * to their corresponding PixiJS instances.
 */
export class EventManager implements IEventManager {
    /**
     * Applies event handlers based on the difference between old and new props.
     * Sets the PixiJS instance's eventMode based on whether handlers are present.
     * @param pixiInstance The PixiJS instance to apply handlers to.
     * @param oldProps The previous props.
     * @param newProps The new props.
     */
    applyEventHandlers(
        pixiInstance: Container,
        oldProps: Record<string, any>,
        newProps: Record<string, any>
    ): void {
        pixiInstance.eventMode = this.hasEventHandlers(newProps) ? 'static' : 'none';

        this.removeEventHandlers(pixiInstance, oldProps, newProps);
        this.addEventHandlers(pixiInstance, oldProps, newProps);
    }

    /**
     * Checks if the given props object contains any event handlers.
     * @param props The props object to check.
     * @returns True if any event handlers are found, false otherwise.
     */
    private hasEventHandlers(props: Record<string, any>): boolean {
        return Object.keys(props).some(key => this.isEventHandler(key));
    }

    /**
     * Determines if a prop key represents an event handler.
     * Convention: starts with 'on' followed by an uppercase letter.
     * @param key The prop key to check.
     * @returns True if the key matches the event handler convention, false otherwise.
     */
    private isEventHandler(key: string): boolean {
        return key.startsWith('on') && typeof key[2] === 'string' && key[2] === key[2].toUpperCase();
    }

    /**
     * Converts a React-style event name (e.g., 'onClick') to a PixiJS event name (e.g., 'pointertap').
     * @param reactEventName The React-style event name.
     * @returns The corresponding PixiJS event name.
     */
    private toPixiEventName(reactEventName: string): string {
        const eventName = reactEventName.slice(2).toLowerCase();

        const eventMap: Record<string, string> = {
            click: 'pointertap',
            mousedown: 'pointerdown',
            mouseup: 'pointerup',
            mousemove: 'pointermove',
            mouseenter: 'pointerover',
            mouseleave: 'pointerout',
            mouseover: 'pointerover',
            mouseout: 'pointerout',
            touchstart: 'pointerdown',
            touchend: 'pointerup',
            touchmove: 'pointermove'
            // Add other mappings as needed
        };

        return eventMap[eventName] || eventName;
    }

    /**
     * Removes event handlers that were present in oldProps but are different or missing in newProps.
     * @param pixiInstance The PixiJS instance.
     * @param oldProps The previous props.
     * @param newProps The new props.
     */
    private removeEventHandlers(pixiInstance: Container, oldProps: Record<string, any>, newProps: Record<string, any>): void {
        for (const key of Object.keys(oldProps)) {
            if (this.isEventHandler(key) && typeof oldProps[key] === 'function') {
                if (!newProps[key] || oldProps[key] !== newProps[key]) {
                    const pixiEventName = this.toPixiEventName(key);
                    pixiInstance.off(pixiEventName, oldProps[key]);
                }
            }
        }
    }

    /**
     * Adds event handlers that are present in newProps but were missing or different in oldProps.
     * @param pixiInstance The PixiJS instance.
     * @param oldProps The previous props.
     * @param newProps The new props.
     */
    private addEventHandlers(pixiInstance: Container, oldProps: Record<string, any>, newProps: Record<string, any>): void {
        for (const key of Object.keys(newProps)) {
            if (this.isEventHandler(key) && typeof newProps[key] === 'function') {
                if (!oldProps[key] || oldProps[key] !== newProps[key]) {
                    const pixiEventName = this.toPixiEventName(key);
                    pixiInstance.on(pixiEventName, newProps[key] as (event: FederatedPointerEvent) => void);
                }
            }
        }
    }
}
