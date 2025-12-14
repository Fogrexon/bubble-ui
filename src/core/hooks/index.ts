// src/core/hooks/index.ts

export { useState } from './useState';
export { useEffect } from './useEffect';
export { useMemo } from './useMemo';
export { useCallback } from './useCallback';

export {
  prepareHooks,
  commitHooks,
  cleanupHooks,
  // currentComponent, // これらは内部的な状態なので、直接エクスポートしない方が良い
  // hookIndex,        // manageHooks内でカプセル化されているか、ヘルパー経由でアクセス
  // incrementHookIndex, // フック内部でのみ使用
  // getCurrentHookState, // フック内部でのみ使用
  // setHookState         // フック内部でのみ使用
} from './manageHooks';

// useEffectのヘルパーも、通常は外部に公開する必要はない
// export { runEffect, cleanupEffect } from './useEffect';
