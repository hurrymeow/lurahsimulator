import { KEL_BUILDINGS, KEL_COMBOS, KEL_EVENTS, KEL_JOBS, KEL_METERS } from './kelurahan';
import { RW_BUILDINGS, RW_COMBOS, RW_EVENTS, RW_JOBS, RW_METERS } from './rw';

export * from './types';
export * from './rules';
export * from './stages';

export const STAGE_METERS = [...RW_METERS, ...KEL_METERS];
export const STAGE_BUILDINGS = [...RW_BUILDINGS, ...KEL_BUILDINGS];
export const STAGE_COMBOS = [...RW_COMBOS, ...KEL_COMBOS];
export const STAGE_JOBS = [...RW_JOBS, ...KEL_JOBS];
export const STAGE_EVENTS = [...RW_EVENTS, ...KEL_EVENTS];
