// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
// SPDX-License-Identifier: MIT

// Future reader, please forgive me for what I am about to do.

#include <QDebug>
#include <QJSValue>
#include <QObject>

/**
 * Create a request that can be called externally via DBus method. Must be defined in the private part of the class.
 * @param RETURN_TYPE return type of the request. Must be a type, that converts to the DBus types and not void.
 * @param REQUEST_NAME name of the request
 * @param INPUT_PARAMS Input parameters of the request in the form of function signature.
 *        Must contain only the types, that could be converted to the DBus types.
 */
#define EXTERNAL_REQUEST(RETURN_TYPE, REQUEST_NAME, INPUT_PARAMS)                                                                                              \
    Q_PROPERTY(QJSValue REQUEST_NAME##_handler READ REQUEST_NAME##_handler WRITE set##REQUEST_NAME##_handler);                                                 \
                                                                                                                                                               \
    QJSValue m_##REQUEST_NAME##_handler;                                                                                                                       \
                                                                                                                                                               \
public:                                                                                                                                                        \
    QJSValue REQUEST_NAME##_handler() const                                                                                                                    \
    {                                                                                                                                                          \
        return m_##REQUEST_NAME##_handler;                                                                                                                     \
    }                                                                                                                                                          \
    void set##REQUEST_NAME##_handler(const QJSValue &handler)                                                                                                  \
    {                                                                                                                                                          \
        if (!handler.isCallable()) {                                                                                                                           \
            qDebug() << "[Bismuth] [DBus Plugin] Cannot assign a handler to" << #REQUEST_NAME << "as it's not callable!";                                      \
            return;                                                                                                                                            \
        }                                                                                                                                                      \
        m_##REQUEST_NAME##_handler = handler;                                                                                                                  \
    }                                                                                                                                                          \
                                                                                                                                                               \
public Q_SLOTS:                                                                                                                                                \
    Q_SCRIPTABLE RETURN_TYPE REQUEST_NAME INPUT_PARAMS;                                                                                                        \
                                                                                                                                                               \
private:

/**
 * Maps the arguments of an EXTERNAL_REQUEST with the provided signature to the QJSValueList
 * @param ... Body of a lambda, that maps args of a DBus call to the QJSValueList for JS handler call
 */
#define EXTERNAL_REQUEST_MAPPER(RETURN_TYPE, REQUEST_NAME, INPUT_PARAMS, ...)                                                                                  \
    RETURN_TYPE DBusService::REQUEST_NAME INPUT_PARAMS                                                                                                         \
    {                                                                                                                                                          \
        if (m_##REQUEST_NAME##_handler.isCallable()) {                                                                                                         \
            auto args = [&]() -> QJSValueList {                                                                                                                \
                __VA_ARGS__                                                                                                                                    \
            }();                                                                                                                                               \
                                                                                                                                                               \
            auto result = m_##REQUEST_NAME##_handler.call(args);                                                                                               \
            return result.toVariant().value<RETURN_TYPE>();                                                                                                    \
        } else {                                                                                                                                               \
            qDebug() << "[Bismuth] [DBus Plugin] Cannot call handler for" << #REQUEST_NAME << "as it's not callable!";                                         \
            return {};                                                                                                                                         \
        }                                                                                                                                                      \
    }
