// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@genda.life>
// SPDX-License-Identifier: MIT

#pragma once

#include <QObject>
#include <QVariant>

#define BI_PROPERTY(TYPE, NAME, SETTER_NAME)                                                                                                                   \
    Q_PROPERTY(TYPE NAME READ NAME WRITE SETTER_NAME);                                                                                                         \
                                                                                                                                                               \
    TYPE NAME() const                                                                                                                                          \
    {                                                                                                                                                          \
        return m_kwinImpl->property(#NAME).value<TYPE>();                                                                                                      \
    }                                                                                                                                                          \
                                                                                                                                                               \
    void SETTER_NAME(const TYPE &value)                                                                                                                        \
    {                                                                                                                                                          \
        m_kwinImpl->setProperty(#NAME, QVariant::fromValue(value));                                                                                            \
    }

#define BI_READONLY_PROPERTY(TYPE, NAME)                                                                                                                       \
    Q_PROPERTY(TYPE NAME READ NAME);                                                                                                                           \
                                                                                                                                                               \
    TYPE NAME() const                                                                                                                                          \
    {                                                                                                                                                          \
        return m_kwinImpl->property(#NAME).value<TYPE>();                                                                                                      \
    }

/**
 * Wrap QML API method
 *
 * @param RET_TYPE return type of a method
 * @param SIGNATURE method signature, that consists of method name (without
 *        object association) and arguments types. Constness is not needed!
 */
#define BI_METHOD_IMPL_WRAP(RET_TYPE, SIGNATURE, ...)                                                                                                          \
    {                                                                                                                                                          \
        auto implMeta = m_kwinImpl->metaObject();                                                                                                              \
        /* Signature must not contain return value and cost status*/                                                                                           \
        auto normSignature = QMetaObject::normalizedSignature(SIGNATURE);                                                                                      \
        auto methodIndex = implMeta->indexOfMethod(normSignature);                                                                                             \
        auto method = implMeta->method(methodIndex);                                                                                                           \
        auto result = RET_TYPE();                                                                                                                              \
        method.invoke(m_kwinImpl, Qt::DirectConnection, Q_RETURN_ARG(RET_TYPE, result), __VA_ARGS__);                                                          \
        return result;                                                                                                                                         \
    }

/**
 * Wrap simple signal to forward it from KWin Class
 * @param SIGNATURE signal signature, that can be put inside SIGNAL Qt macro
 */
#define WRAP_SIGNAL(SIGNATURE) connect(m_kwinImpl, SIGNAL(SIGNATURE), this, SIGNAL(SIGNATURE))

/**
 * Wrap signal with KWin Type in signature. Signal should have a mapper, that
 * must have the same signature as the signal.
 * @param SIGNATURE signal signature, that can be put inside SIGNAL/SLOT Qt macro
 */
#define WRAP_SIGNAL_WITH_KWIN_TYPE(SIGNATURE) connect(m_kwinImpl, SIGNAL(SIGNATURE), this, SLOT(mapper_##SIGNATURE))
