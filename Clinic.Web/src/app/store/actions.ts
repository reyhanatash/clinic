import { createAction, props } from '@ngrx/store';

export const setObject = createAction(
  '[Object] Set',
  props<{ obj: any }>()
);

export const clearObject = createAction('[Object] Clear');