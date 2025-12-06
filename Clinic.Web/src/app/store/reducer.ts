import { createReducer, on } from '@ngrx/store';
import { setObject, clearObject } from './actions';

export interface ObjectState {
  obj: any;
}

export const initialState: ObjectState = {
  obj: null
};

export const objectReducer = createReducer(
  initialState,
  on(setObject, (state, { obj }) => ({ ...state, obj })),
  on(clearObject, state => ({ ...state, obj: null }))
);
