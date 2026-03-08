---
trigger: always_on
---

# コードスタイル

- PEP 8 に準拠
- 適切なコメントを付与
- コミット前に必ず `eslint` および `prettier` を実行し、エラーやワーニングがない状態にすること

```PowerShell
npm run lint:eslint

npm run lint:prettier


# 両方同時にやる場合
npm run lint:fix
```