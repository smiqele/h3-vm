// Generated from statuses.yaml. Do not edit by hand.
export const resourceStatuses = {
  "virtual-machine": {
    "creating": {
      "label": "Создаётся",
      "tone": "progress",
      "animated": true
    },
    "running": {
      "label": "Работает",
      "tone": "positive",
      "animated": false
    },
    "stopping": {
      "label": "Останавливается",
      "tone": "progress",
      "animated": true
    },
    "stopped": {
      "label": "Остановлена",
      "tone": "neutral",
      "animated": false
    },
    "starting": {
      "label": "Запускается",
      "tone": "progress",
      "animated": true
    },
    "restarting": {
      "label": "Перезапускается",
      "tone": "progress",
      "animated": true
    },
    "updating": {
      "label": "Изменяется",
      "tone": "progress",
      "animated": true
    },
    "deleting": {
      "label": "Удаляется",
      "tone": "progress",
      "animated": true
    },
    "error": {
      "label": "Ошибка",
      "tone": "danger",
      "animated": false
    },
    "provisioning_failed": {
      "label": "Не создана",
      "tone": "danger",
      "animated": false
    },
    "unknown": {
      "label": "Статус неизвестен",
      "tone": "unknown",
      "animated": false
    }
  },
  "disk": {
    "creating": {
      "label": "Создаётся",
      "tone": "progress",
      "animated": true
    },
    "attached": {
      "label": "Подключён",
      "tone": "positive",
      "animated": false
    },
    "available": {
      "label": "Свободен",
      "tone": "neutral",
      "animated": false
    },
    "attaching": {
      "label": "Подключается",
      "tone": "progress",
      "animated": true
    },
    "deleting": {
      "label": "Удаляется",
      "tone": "progress",
      "animated": true
    },
    "error": {
      "label": "Ошибка",
      "tone": "danger",
      "animated": false
    },
    "unknown": {
      "label": "Статус неизвестен",
      "tone": "unknown",
      "animated": false
    }
  },
  "public-ip": {
    "assigned": {
      "label": "Назначен",
      "tone": "positive",
      "animated": false
    },
    "available": {
      "label": "Свободен",
      "tone": "neutral",
      "animated": false
    },
    "assigning": {
      "label": "Назначается",
      "tone": "progress",
      "animated": true
    },
    "error": {
      "label": "Ошибка",
      "tone": "danger",
      "animated": false
    },
    "unknown": {
      "label": "Статус неизвестен",
      "tone": "unknown",
      "animated": false
    }
  },
  "database-cluster": {
    "creating": {
      "label": "Создаётся",
      "tone": "progress",
      "animated": true
    },
    "running": {
      "label": "Работает",
      "tone": "positive",
      "animated": false
    },
    "maintenance": {
      "label": "Обслуживание",
      "tone": "warning",
      "animated": true
    },
    "deleting": {
      "label": "Удаляется",
      "tone": "progress",
      "animated": true
    },
    "error": {
      "label": "Ошибка",
      "tone": "danger",
      "animated": false
    },
    "unknown": {
      "label": "Статус неизвестен",
      "tone": "unknown",
      "animated": false
    }
  }
} as const;
