// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#define DOCTEST_CONFIG_IMPLEMENT
#include <doctest/doctest.h>

#include <QCoreApplication>
#include <QTimer>

int main(int argc, char **argv)
{
    // Init core application to be able to use Qt stuff
    QCoreApplication app(argc, argv);

    auto testRunner = [&]() {
        doctest::Context context;
        context.applyCommandLine(argc, argv);
        app.exit(context.run());
    };

    QTimer::singleShot(0, &app, testRunner);
    QTimer::singleShot(0, &app, SLOT(quit()));

    return app.exec();
}
