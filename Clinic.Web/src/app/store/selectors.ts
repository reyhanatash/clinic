import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ObjectState } from './reducer';

export const selectObjectFeature = createFeatureSelector<ObjectState>('object');

export const selectObject = createSelector(
  selectObjectFeature,
  (state: ObjectState) => state.obj
);
