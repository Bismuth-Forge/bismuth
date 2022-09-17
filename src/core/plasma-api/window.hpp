// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include <QIcon>
#include <QList>
#include <QObject>
#include <QRect>
#include <QSize>
#include <QString>
#include <QUuid>

#include "utils.hpp"

namespace PlasmaApi
{
class Workspace;

class Window : public QObject
{
    Q_OBJECT

public:
    Window() = default;
    Window(QObject *kwinImpl);
    Window(const Window &);
    Window(Window &&);
    virtual ~Window() = default;

    Window &operator=(const Window &rhs);
    Window &operator=(Window &&rhs);

    bool operator==(const Window &rhs) const;
    bool operator<(const Window &rhs) const;

    BI_READONLY_PROPERTY(bool, alpha)
    // Q_PROPERTY(bool alpha READ hasAlpha NOTIFY hasAlphaChanged)

    BI_READONLY_PROPERTY(qulonglong, frameId)
    // Q_PROPERTY(qulonglong frameId READ frameId)

    /**
     * This property holds rectangle that the pixmap or buffer of this Window
     * occupies on the screen. This rectangle includes invisible portions of the
     * window, e.g. client-side drop shadows, etc.
     */
    BI_READONLY_PROPERTY(QRectF, bufferGeometry)
    // Q_PROPERTY(QRectF bufferGeometry READ bufferGeometry)

    /**
     * This property holds the position of the Window's frame geometry.
     */
    BI_READONLY_PROPERTY(QPoint, pos)
    // Q_PROPERTY(QPoint pos READ pos)

    /**
     * This property holds the size of the Window's frame geometry.
     */
    BI_READONLY_PROPERTY(QSize, size)
    // Q_PROPERTY(QSize size READ size)

    /**
     * This property holds the x position of the Window's frame geometry.
     */
    BI_READONLY_PROPERTY(int, x)
    // Q_PROPERTY(int x READ x NOTIFY frameGeometryChanged)

    /**
     * This property holds the y position of the Window's frame geometry.
     */
    BI_READONLY_PROPERTY(int, y)
    // Q_PROPERTY(int y READ y NOTIFY frameGeometryChanged)

    /**
     * This property holds the width of the Window's frame geometry.
     */
    BI_READONLY_PROPERTY(int, width)
    // Q_PROPERTY(int width READ width NOTIFY frameGeometryChanged)

    /**
     * This property holds the height of the Window's frame geometry.
     */
    BI_READONLY_PROPERTY(int, height)
    // Q_PROPERTY(int height READ height NOTIFY frameGeometryChanged)

    BI_READONLY_PROPERTY(QRectF, visibleRect)
    // Q_PROPERTY(QRectF visibleRect READ visibleGeometry)

    BI_READONLY_PROPERTY(qreal, opacity)
    // Q_PROPERTY(qreal opacity READ opacity WRITE setOpacity NOTIFY opacityChanged)

    BI_READONLY_PROPERTY(int, screen)
    // Q_PROPERTY(int screen READ screen NOTIFY screenChanged)

    BI_READONLY_PROPERTY(qulonglong, windowId)
    // Q_PROPERTY(qulonglong windowId READ window CONSTANT)

    BI_READONLY_PROPERTY(QRectF, rect)
    // Q_PROPERTY(QRectF rect READ rect)

    BI_READONLY_PROPERTY(QPoint, clientPos)
    // Q_PROPERTY(QPoint clientPos READ clientPos)

    BI_READONLY_PROPERTY(QSize, clientSize)
    // Q_PROPERTY(QSize clientSize READ clientSize)

    BI_READONLY_PROPERTY(QByteArray, resourceName)
    // Q_PROPERTY(QByteArray resourceName READ resourceName NOTIFY windowClassChanged)

    BI_READONLY_PROPERTY(QByteArray, resourceClass)
    // Q_PROPERTY(QByteArray resourceClass READ resourceClass NOTIFY windowClassChanged)

    BI_READONLY_PROPERTY(QByteArray, windowRole)
    // Q_PROPERTY(QByteArray windowRole READ windowRole NOTIFY windowRoleChanged)

    /**
     * Returns whether the window is a desktop background window (the one with wallpaper).
     * See _NET_WM_WINDOW_TYPE_DESKTOP at https://standards.freedesktop.org/wm-spec/wm-spec-latest.html .
     */
    BI_READONLY_PROPERTY(bool, desktopWindow)
    // Q_PROPERTY(bool desktopWindow READ isDesktop)

    /**
     * Returns whether the window is a dock (i.e. a panel).
     * See _NET_WM_WINDOW_TYPE_DOCK at https://standards.freedesktop.org/wm-spec/wm-spec-latest.html .
     */
    BI_READONLY_PROPERTY(bool, dock)
    // Q_PROPERTY(bool dock READ isDock)

    /**
     * Returns whether the window is a standalone (detached) toolbar window.
     * See _NET_WM_WINDOW_TYPE_TOOLBAR at https://standards.freedesktop.org/wm-spec/wm-spec-latest.html .
     */
    BI_READONLY_PROPERTY(bool, toolbar)
    // Q_PROPERTY(bool toolbar READ isToolbar)

    /**
     * Returns whether the window is a torn-off menu.
     * See _NET_WM_WINDOW_TYPE_MENU at https://standards.freedesktop.org/wm-spec/wm-spec-latest.html .
     */
    BI_READONLY_PROPERTY(bool, menu)
    // Q_PROPERTY(bool menu READ isMenu)

    /**
     * Returns whether the window is a "normal" window, i.e. an application or any other window
     * for which none of the specialized window types fit.
     * See _NET_WM_WINDOW_TYPE_NORMAL at https://standards.freedesktop.org/wm-spec/wm-spec-latest.html .
     */
    BI_READONLY_PROPERTY(bool, normalWindow)
    // Q_PROPERTY(bool normalWindow READ isNormalWindow)

    /**
     * Returns whether the window is a dialog window.
     * See _NET_WM_WINDOW_TYPE_DIALOG at https://standards.freedesktop.org/wm-spec/wm-spec-latest.html .
     */
    BI_READONLY_PROPERTY(bool, dialog)
    // Q_PROPERTY(bool dialog READ isDialog)

    /**
     * Returns whether the window is a splashscreen. Note that many (especially older) applications
     * do not support marking their splash windows with this type.
     * See _NET_WM_WINDOW_TYPE_SPLASH at https://standards.freedesktop.org/wm-spec/wm-spec-latest.html .
     */
    BI_READONLY_PROPERTY(bool, splash)
    // Q_PROPERTY(bool splash READ isSplash)

    /**
     * Returns whether the window is a utility window, such as a tool window.
     * See _NET_WM_WINDOW_TYPE_UTILITY at https://standards.freedesktop.org/wm-spec/wm-spec-latest.html .
     */
    BI_READONLY_PROPERTY(bool, utility)
    // Q_PROPERTY(bool utility READ isUtility)

    /**
     * Returns whether the window is a dropdown menu (i.e. a popup directly or indirectly open
     * from the applications menubar).
     * See _NET_WM_WINDOW_TYPE_DROPDOWN_MENU at https://standards.freedesktop.org/wm-spec/wm-spec-latest.html .
     */
    BI_READONLY_PROPERTY(bool, dropdownMenu)
    // Q_PROPERTY(bool dropdownMenu READ isDropdownMenu)

    /**
     * Returns whether the window is a popup menu (that is not a torn-off or dropdown menu).
     * See _NET_WM_WINDOW_TYPE_POPUP_MENU at https://standards.freedesktop.org/wm-spec/wm-spec-latest.html .
     */
    BI_READONLY_PROPERTY(bool, popupMenu)
    // Q_PROPERTY(bool popupMenu READ isPopupMenu)

    /**
     * Returns whether the window is a tooltip.
     * See _NET_WM_WINDOW_TYPE_TOOLTIP at https://standards.freedesktop.org/wm-spec/wm-spec-latest.html .
     */
    BI_READONLY_PROPERTY(bool, tooltip)
    // Q_PROPERTY(bool tooltip READ isTooltip)

    /**
     * Returns whether the window is a window with a notification.
     * See _NET_WM_WINDOW_TYPE_NOTIFICATION at https://standards.freedesktop.org/wm-spec/wm-spec-latest.html .
     */
    BI_READONLY_PROPERTY(bool, notification)
    // Q_PROPERTY(bool notification READ isNotification)

    /**
     * Returns whether the window is a window with a critical notification.
     */
    BI_READONLY_PROPERTY(bool, criticalNotification)
    // Q_PROPERTY(bool criticalNotification READ isCriticalNotification)

    /**
     * Returns whether the window is an applet popup.
     */
    BI_READONLY_PROPERTY(bool, appletPopup)
    // Q_PROPERTY(bool appletPopup READ isAppletPopup)

    /**
     * Returns whether the window is an On Screen Display.
     */
    BI_READONLY_PROPERTY(bool, onScreenDisplay)
    // Q_PROPERTY(bool onScreenDisplay READ isOnScreenDisplay)

    /**
     * Returns whether the window is a combobox popup.
     * See _NET_WM_WINDOW_TYPE_COMBO at https://standards.freedesktop.org/wm-spec/wm-spec-latest.html .
     */
    BI_READONLY_PROPERTY(bool, comboBox)
    // Q_PROPERTY(bool comboBox READ isComboBox)

    /**
     * Returns whether the window is a Drag&Drop icon.
     * See _NET_WM_WINDOW_TYPE_DND at https://standards.freedesktop.org/wm-spec/wm-spec-latest.html .
     */
    BI_READONLY_PROPERTY(bool, dndIcon)
    // Q_PROPERTY(bool dndIcon READ isDNDIcon)

    /**
     * Returns the NETWM window type
     * See https://standards.freedesktop.org/wm-spec/wm-spec-latest.html .
     */
    BI_READONLY_PROPERTY(int, windowType)
    // Q_PROPERTY(int windowType READ windowType)

    /**
     * Whether this Window is managed by KWin (it has control over its placement and other
     * aspects, as opposed to override-redirect windows that are entirely handled by the application).
     */
    BI_READONLY_PROPERTY(int, managed)
    // Q_PROPERTY(bool managed READ isClient CONSTANT)

    /**
     * Whether this Window represents an already deleted window and only kept for the compositor for animations.
     */
    BI_READONLY_PROPERTY(int, deleted)
    // Q_PROPERTY(bool deleted READ isDeleted CONSTANT)

    /**
     * Whether the window has an own shape
     */
    BI_READONLY_PROPERTY(bool, shaped)
    // Q_PROPERTY(bool shaped READ shape NOTIFY shapedChanged)

    /**
     * Whether the window does not want to be animated on window close.
     * There are legit reasons for this like a screenshot application which does not want it's
     * window being captured.
     */
    // Q_PROPERTY(bool skipsCloseAnimation READ skipsCloseAnimation WRITE setSkipCloseAnimation NOTIFY skipCloseAnimationChanged)

    /**
     * Interface to the Wayland Surface.
     * Relevant only in Wayland, in X11 it will be nullptr
     */
    // Q_PROPERTY(KWaylandServer::SurfaceInterface *surface READ surface)

    /**
     * Whether the window is a popup.
     */
    BI_READONLY_PROPERTY(bool, popupWindow)
    // Q_PROPERTY(bool popupWindow READ isPopupWindow)

    /**
     * Whether this Window represents the outline.
     *
     * @note It's always @c false if compositing is turned off.
     */
    BI_READONLY_PROPERTY(bool, outline)
    // Q_PROPERTY(bool outline READ isOutline)

    /**
     * This property holds a UUID to uniquely identify this Window.
     */
    BI_READONLY_PROPERTY(QUuid, internalId)
    // Q_PROPERTY(QUuid internalId READ internalId CONSTANT)

    /**
     * The pid of the process owning this window.
     *
     * @since 5.20
     */
    BI_READONLY_PROPERTY(int, pid)
    // Q_PROPERTY(int pid READ pid CONSTANT)

    /**
     * The position of this window within Workspace's window stack.
     */
    BI_READONLY_PROPERTY(int, stackingOrder)
    // Q_PROPERTY(int stackingOrder READ stackingOrder NOTIFY stackingOrderChanged)

    /**
     * Whether this Window is fullScreen. A Window might either be fullScreen due to the _NET_WM property
     * or through a legacy support hack. The fullScreen state can only be changed if the Window does not
     * use the legacy hack. To be sure whether the state changed, connect to the notify signal.
     */
    BI_PROPERTY(bool, fullScreen, setFullScreen)
    // Q_PROPERTY(bool fullScreen READ isFullScreen WRITE setFullScreen NOTIFY fullScreenChanged)

    /**
     * Whether the Window can be set to fullScreen. The property is evaluated each time it is invoked.
     * Because of that there is no notify signal.
     */
    BI_READONLY_PROPERTY(bool, fullScreenable)
    // Q_PROPERTY(bool fullScreenable READ isFullScreenable)

    /**
     * Whether this Window is active or not. Use Workspace::activateWindow() to activate a Window.
     * @see Workspace::activateWindow
     */
    BI_READONLY_PROPERTY(bool, active)
    // Q_PROPERTY(bool active READ isActive NOTIFY activeChanged)

    /**
     * The desktop this Window is on. If the Window is on all desktops the property has value -1.
     * This is a legacy property, use x11DesktopIds instead
     *
     * @deprecated Use the desktops property instead.
     */
    BI_PROPERTY(int, desktop, setDesktop)
    // Q_PROPERTY(int desktop READ desktop WRITE setDesktop NOTIFY desktopChanged)

    /**
     * The virtual desktops this client is on. If it's on all desktops, the list is empty.
     */
    // Q_PROPERTY(QVector<KWin::VirtualDesktop *> desktops READ desktops WRITE setDesktops NOTIFY desktopChanged)

    /**
     * Whether the Window is on all desktops. That is desktop is -1.
     */
    BI_PROPERTY(bool, onAllDesktops, setOnAllDesktops)
    // Q_PROPERTY(bool onAllDesktops READ isOnAllDesktops WRITE setOnAllDesktops NOTIFY desktopChanged)

    /**
     * The activities this client is on. If it's on all activities the property is empty.
     */
    BI_READONLY_PROPERTY(QStringList, activities)
    // Q_PROPERTY(QStringList activities READ activities WRITE setOnActivities NOTIFY activitiesChanged)

    /**
     * The x11 ids for all desktops this client is in. On X11 this list will always have a length of 1
     *
     * @deprecated prefer using apis that use VirtualDesktop objects
     */
    // Q_PROPERTY(QVector<uint> x11DesktopIds READ x11DesktopIds NOTIFY x11DesktopIdsChanged)

    /**
     * Indicates that the window should not be included on a taskbar.
     */
    BI_PROPERTY(bool, skipTaskbar, setSkipTaskbar)
    // Q_PROPERTY(bool skipTaskbar READ skipTaskbar WRITE setSkipTaskbar NOTIFY skipTaskbarChanged)

    /**
     * Indicates that the window should not be included on a Pager.
     */
    BI_PROPERTY(bool, skipPager, setSkipPager)
    // Q_PROPERTY(bool skipPager READ skipPager WRITE setSkipPager NOTIFY skipPagerChanged)

    /**
     * Whether the Window should be excluded from window switching effects.
     */
    BI_PROPERTY(bool, skipSwitcher, setSkipSwitcher)
    // Q_PROPERTY(bool skipSwitcher READ skipSwitcher WRITE setSkipSwitcher NOTIFY skipSwitcherChanged)

    /**
     * Whether the window can be closed by the user.
     */
    BI_READONLY_PROPERTY(bool, closeable)
    // Q_PROPERTY(bool closeable READ isCloseable NOTIFY closeableChanged)

    BI_READONLY_PROPERTY(QIcon, icon)
    // Q_PROPERTY(QIcon icon READ icon NOTIFY iconChanged)

    /**
     * Whether the Window is set to be kept above other windows.
     */
    BI_PROPERTY(bool, keepAbove, setKeepAbove)
    // Q_PROPERTY(bool keepAbove READ keepAbove WRITE setKeepAbove NOTIFY keepAboveChanged)

    /**
     * Whether the Window is set to be kept below other windows.
     */
    BI_PROPERTY(bool, keepBelow, setKeepBelow);
    // Q_PROPERTY(bool keepBelow READ keepBelow WRITE setKeepBelow NOTIFY keepBelowChanged)

    /**
     * Whether the Window can be shaded. The property is evaluated each time it is invoked.
     * Because of that there is no notify signal.
     */
    BI_READONLY_PROPERTY(bool, shadeable)
    // Q_PROPERTY(bool shadeable READ isShadeable)

    /**
     * Whether the Window is shaded.
     */
    BI_PROPERTY(bool, shade, setShade);
    // Q_PROPERTY(bool shade READ isShade WRITE setShade NOTIFY shadeChanged)

    /**
     * Whether the Window can be minimized. The property is evaluated each time it is invoked.
     * Because of that there is no notify signal.
     */
    BI_READONLY_PROPERTY(bool, minimizable)
    // Q_PROPERTY(bool minimizable READ isMinimizable)

    /**
     * Whether the Window is minimized.
     */
    BI_PROPERTY(bool, minimized, setMinimized);
    // Q_PROPERTY(bool minimized READ isMinimized WRITE setMinimized NOTIFY minimizedChanged)

    /**
     * The optional geometry representing the minimized Window in e.g a taskbar.
     * See _NET_WM_ICON_GEOMETRY at https://standards.freedesktop.org/wm-spec/wm-spec-latest.html .
     * The value is evaluated each time the getter is called.
     * Because of that no changed signal is provided.
     */
    BI_READONLY_PROPERTY(QRectF, iconGeometry)
    // Q_PROPERTY(QRectF iconGeometry READ iconGeometry)

    /**
     * Returns whether the window is any of special windows types (desktop, dock, splash, ...),
     * i.e. window types that usually don't have a window frame and the user does not use window
     * management (moving, raising,...) on them.
     * The value is evaluated each time the getter is called.
     * Because of that no changed signal is provided.
     */
    BI_READONLY_PROPERTY(bool, specialWindow)
    // Q_PROPERTY(bool specialWindow READ isSpecialWindow)

    /**
     * Whether window state _NET_WM_STATE_DEMANDS_ATTENTION is set. This state indicates that some
     * action in or with the window happened. For example, it may be set by the Window Manager if
     * the window requested activation but the Window Manager refused it, or the application may set
     * it if it finished some work. This state may be set by both the Window and the Window Manager.
     * It should be unset by the Window Manager when it decides the window got the required attention
     * (usually, that it got activated).
     */
    BI_PROPERTY(bool, demandAttention, setDemandsAttention)
    // Q_PROPERTY(bool demandsAttention READ isDemandingAttention WRITE demandAttention NOTIFY demandsAttentionChanged)

    /**
     * The Caption of the Window. Read from WM_NAME property together with a suffix for hostname and shortcut.
     * To read only the caption as provided by WM_NAME, use the getter with an additional @c false value.
     */
    BI_READONLY_PROPERTY(QString, caption)
    // Q_PROPERTY(QString caption READ caption NOTIFY captionChanged)

    /**
     * Minimum size as specified in WM_NORMAL_HINTS
     */
    BI_READONLY_PROPERTY(QSize, minSize)
    // Q_PROPERTY(QSize minSize READ minSize)

    /**
     * Maximum size as specified in WM_NORMAL_HINTS
     */
    BI_READONLY_PROPERTY(QSize, maxSize)
    // Q_PROPERTY(QSize maxSize READ maxSize)

    /**
     * Whether the Window can accept keyboard focus.
     * The value is evaluated each time the getter is called.
     * Because of that no changed signal is provided.
     */
    BI_READONLY_PROPERTY(bool, wantsInput)
    // Q_PROPERTY(bool wantsInput READ wantsInput)

    /**
     * Whether the Window is a transient Window to another Window.
     * @see transientFor
     */
    BI_READONLY_PROPERTY(bool, transient)
    // Q_PROPERTY(bool transient READ isTransient NOTIFY transientChanged)

    /**
     * The Window to which this Window is a transient if any.
     */
    // Q_PROPERTY(KWin::Window *transientFor READ transientFor NOTIFY transientChanged)

    /**
     * Whether the Window represents a modal window.
     */
    BI_READONLY_PROPERTY(bool, modal)
    // Q_PROPERTY(bool modal READ isModal NOTIFY modalChanged)

    /**
     * The geometry of this Window. Be aware that depending on resize mode the frameGeometryChanged
     * signal might be emitted at each resize step or only at the end of the resize operation.
     *
     * @deprecated Use frameGeometry
     */
    // Q_PROPERTY(QRectF geometry READ frameGeometry WRITE moveResize NOTIFY frameGeometryChanged)

    /**
     * The geometry of this Window. Be aware that depending on resize mode the frameGeometryChanged
     * signal might be emitted at each resize step or only at the end of the resize operation.
     */
    BI_PROPERTY(QRectF, frameGeometry, setFrameGeometry)
    // Q_PROPERTY(QRectF frameGeometry READ frameGeometry WRITE moveResize NOTIFY frameGeometryChanged)

    /**
     * Whether the Window is currently being moved by the user.
     * Notify signal is emitted when the Window starts or ends move/resize mode.
     */
    BI_READONLY_PROPERTY(bool, move)
    // Q_PROPERTY(bool move READ isInteractiveMove NOTIFY moveResizedChanged)

    /**
     * Whether the Window is currently being resized by the user.
     * Notify signal is emitted when the Window starts or ends move/resize mode.
     */
    BI_READONLY_PROPERTY(bool, resize)
    // Q_PROPERTY(bool resize READ isInteractiveResize NOTIFY moveResizedChanged)

    /**
     * Whether the decoration is currently using an alpha channel.
     */
    BI_READONLY_PROPERTY(bool, decorationHasAlpha)
    // Q_PROPERTY(bool decorationHasAlpha READ decorationHasAlpha)

    /**
     * Whether the window has a decoration or not.
     * This property is not allowed to be set by applications themselves.
     * The decision whether a window has a border or not belongs to the window manager.
     * If this property gets abused by application developers, it will be removed again.
     */
    // Q_PROPERTY(bool noBorder READ noBorder WRITE setNoBorder)

    /**
     * Whether the Window provides context help. Mostly needed by decorations to decide whether to
     * show the help button or not.
     */
    BI_READONLY_PROPERTY(bool, providesContextHelp)
    // Q_PROPERTY(bool providesContextHelp READ providesContextHelp CONSTANT)

    /**
     * Whether the Window can be maximized both horizontally and vertically.
     * The property is evaluated each time it is invoked.
     * Because of that there is no notify signal.
     */
    BI_READONLY_PROPERTY(bool, maximizable)
    // Q_PROPERTY(bool maximizable READ isMaximizable)

    /**
     * Whether the Window is moveable. Even if it is not moveable, it might be possible to move
     * it to another screen. The property is evaluated each time it is invoked.
     * Because of that there is no notify signal.
     * @see moveableAcrossScreens
     */
    BI_READONLY_PROPERTY(bool, moveable)
    // Q_PROPERTY(bool moveable READ isMovable)

    /**
     * Whether the Window can be moved to another screen. The property is evaluated each time it is invoked.
     * Because of that there is no notify signal.
     * @see moveable
     */
    BI_READONLY_PROPERTY(bool, moveableAcrossScreens)
    // Q_PROPERTY(bool moveableAcrossScreens READ isMovableAcrossScreens)

    /**
     * Whether the Window can be resized. The property is evaluated each time it is invoked.
     * Because of that there is no notify signal.
     */
    BI_READONLY_PROPERTY(bool, resizeable)
    // Q_PROPERTY(bool resizeable READ isResizable)

    /**
     * The desktop file name of the application this Window belongs to.
     *
     * This is either the base name without full path and without file extension of the
     * desktop file for the window's application (e.g. "org.kde.foo").
     *
     * The application's desktop file name can also be the full path to the desktop file
     * (e.g. "/opt/kde/share/org.kde.foo.desktop") in case it's not in a standard location.
     */
    BI_READONLY_PROPERTY(QByteArray, desktopFileName)
    // Q_PROPERTY(QByteArray desktopFileName READ desktopFileName NOTIFY desktopFileNameChanged)

    /**
     * Whether an application menu is available for this Window
     */
    BI_READONLY_PROPERTY(bool, hasApplicationMenu)
    // Q_PROPERTY(bool hasApplicationMenu READ hasApplicationMenu NOTIFY hasApplicationMenuChanged)

    /**
     * Whether the application menu for this Window is currently opened
     */
    BI_READONLY_PROPERTY(bool, applicationMenuActive)
    // Q_PROPERTY(bool applicationMenuActive READ applicationMenuActive NOTIFY applicationMenuActiveChanged)

    /**
     * Whether this window is unresponsive.
     *
     * When an application failed to react on a ping request in time, it is
     * considered unresponsive. This usually indicates that the application froze or crashed.
     */
    BI_READONLY_PROPERTY(bool, unresponsive)
    // Q_PROPERTY(bool unresponsive READ unresponsive NOTIFY unresponsiveChanged)

    /**
     * The color scheme set on this window
     * Absolute file path, or name of palette in the user's config directory following KColorSchemes format.
     * An empty string indicates the default palette from kdeglobals is used.
     * @note this indicates the colour scheme requested, which might differ from the theme applied if the colorScheme cannot be found
     */
    BI_READONLY_PROPERTY(QString, colorScheme)
    // Q_PROPERTY(QString colorScheme READ colorScheme NOTIFY colorSchemeChanged)

    // Q_PROPERTY(KWin::Layer layer READ layer)

    /**
     * Whether this window is hidden. It's usually the case with auto-hide panels.
     */
    BI_READONLY_PROPERTY(bool, hidden)
    // Q_PROPERTY(bool hidden READ isHiddenInternal NOTIFY hiddenChanged)

private:
    QObject *m_kwinImpl;

    friend class PlasmaApi::Workspace;
};

}

Q_DECLARE_METATYPE(PlasmaApi::Window);
