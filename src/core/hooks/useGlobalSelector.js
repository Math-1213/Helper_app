import { useSelector } from 'react-redux';

export function useGlobalSelector(selectorFn) {
  return useSelector(selectorFn);
}
