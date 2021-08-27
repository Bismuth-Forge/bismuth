// Copyright (c) 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the "Software"),
// to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL
// THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

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
