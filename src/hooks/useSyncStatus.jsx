import React, { useState, useEffect } from "react";
import { useSyncStatus as useGlobalSyncStatus } from "@components/ui/SyncStatusProvider";

// Real-time sync statuses
export const STATUS_TYPES = {
  SYNCED: { id: "synced", color: "bg-green-500", label: "Synced" },
  SYNCING: { id: "syncing", color: "bg-yellow-500", label: "Syncing..." },
  ERROR: { id: "error", color: "bg-red-500", label: "Sync Failed" },
  OFFLINE: { id: "offline", color: "bg-gray-500", label: "Offline" },
};

export const useSyncStatus = (componentIds = []) => {
  let globalContext = null;
  try {
    globalContext = useGlobalSyncStatus();
  } catch (e) {
    // Component used outside SyncStatusProvider
  }

  const [statuses, setStatuses] = useState({});

  useEffect(() => {
    const rawStatus = globalContext?.status;
    let mapped = STATUS_TYPES.SYNCED;
    if (rawStatus === "syncing") mapped = STATUS_TYPES.SYNCING;
    else if (rawStatus === "error") mapped = STATUS_TYPES.ERROR;
    else if (rawStatus === "offline") mapped = STATUS_TYPES.OFFLINE;

    const updated = {};
    componentIds.forEach((id) => {
      updated[id] = mapped;
    });
    setStatuses(updated);
  }, [componentIds.join(","), globalContext?.status]);

  return statuses;
};

export const SyncStatusIndicator = ({ status }) => {
  if (!status) return null;

  return (
    <div className="group relative flex items-center justify-center ml-auto">
      <div
        className={`w-2.5 h-2.5 rounded-full ${status.color} shadow-sm ring-1 ring-white/20 transition-colors duration-300`}
      />
      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
        {status.label}
      </div>
    </div>
  );
};
