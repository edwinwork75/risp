// src/services/action.service.ts
import { ALL_ACTIONS } from "../constants/actions";

/**
 * @desc Returns a list of all available system actions
 */
export const listAllActions = (): string[] => {
    return ALL_ACTIONS;
};
