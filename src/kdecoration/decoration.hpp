// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include <QVariant>

#include <KConfigWatcher>
#include <KDecoration2/Decoration>

namespace Bismuth
{
class Decoration : public KDecoration2::Decoration
{
    Q_OBJECT
public:
    explicit Decoration(QObject *parent = nullptr, const QVariantList &args = QVariantList());

    /**
     * Provides the rendering.
     *
     * The painter is set up to paint on an internal QPaintDevice. The painting is implicitly double buffered.
     */
    void paint(QPainter *painter, const QRect &repaintRegion) override;

public Q_SLOTS:
    /**
     * This method gets invoked once the Decoration is created and completely setup.
     *
     * All initialization must be performed in this method instead of the constructor.
     */
    void init() override;

private:
    void paintBorders(QPainter &painter);

    void updateColors();
    void setBorderSizes();
    void connectEvents();

    int borderSize() const;

    QColor m_activeColor;
    QColor m_inactiveColor;

    KConfigWatcher::Ptr m_kdeglobalsWatcher;
};

}
