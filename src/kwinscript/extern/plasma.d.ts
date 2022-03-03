// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
//
// SPDX-License-Identifier: MIT

/* eslint-disable @typescript-eslint/ban-types */

declare namespace Plasma {
  namespace TaskManager {
    /* reference: https://github.com/KDE/plasma-workspace/blob/master/libtaskmanager/activityinfo.h */
    interface ActivityInfo {
      /* read-only */
      readonly currentActivity: string;
      readonly numberOfRunningActivities: number;

      /* methods */
      runningActivities(): string[];
      activityName(id: string): string;

      /* signals */
      currentActivityChanged: QSignal;
      numberOfRunningActivitiesChanged: QSignal;
      namesOfRunningActivitiesChanged: QSignal;
    }
  }

  namespace PlasmaCore {
    /* reference: https://techbase.kde.org/Development/Tutorials/Plasma4/QML/API#DataSource */
    interface DataSource {
      readonly sources: string[];
      readonly valid: boolean;
      readonly data: { [key: string]: object } /* variant map */;

      interval: number;
      engine: string;
      connectedSources: string[];

      /** (sourceName: string, data: object) */
      onNewData: QSignal;
      /** (source: string) */
      onSourceAdded: QSignal;
      /** (source: string) */
      onSourceRemoved: QSignal;
      /** (source: string) */
      onSourceConnected: QSignal;
      /** (source: string) */
      onSourceDisconnected: QSignal;
      onIntervalChanged: QSignal;
      onEngineChanged: QSignal;
      onDataChanged: QSignal;
      onConnectedSourcesChanged: QSignal;
      onSourcesChanged: QSignal;

      keysForSource(source: string): string[];
      serviceForSource(source: string): object; // TODO: returns Service
      connectSource(source: string): void;
      disconnectSource(source: string): void;
    }
  }
}
