---
status: draft
accuracy: reviewed
alignment: partial
reviewedAt: 2026-09-24
---
# Модель сущностей продукта

Это концептуальные сущности и кратности их связей, а не схема таблиц базы данных. Платформенные направления и сервисы показаны в [архитектуре продукта](/docs/product/architecture); здесь остаются общие контексты и связь с плательщиком.

```mermaid
erDiagram
  direction LR
  USER ||--o{ WORKSPACE : administers
  USER ||--o{ PAYMENT_ACCOUNT : controls
  WORKSPACE ||--o{ PROJECT : contains
  PROJECT ||--o{ RESOURCE : contains
  WORKSPACE ||--o{ PAYMENT_BINDING : has
  PAYMENT_ACCOUNT ||--o{ PAYMENT_BINDING : pays

  PAYMENT_BINDING {
    string paymentMode
    datetime startsAt
    datetime endsAt
  }
```

У каждого Resource ровно один Project; Workspace определяется через него. Это правило едино для ресурсов разных сервисов. VM и Database Cluster — конкретные виды Resource, их поля и операции описываются в документах доменов.

Payment Binding обозначает платёжную привязку, описанную в [биллинге](/docs/domains/billing), а не отдельный баланс Workspace. История привязок сохраняется; во время платного потребления у Workspace действует ровно одна активная привязка к Payment Account. Режим оплаты и границы действия принадлежат этой связи.
