// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@genda.life>
// SPDX-License-Identifier: MIT

#pragma once

#define BI_READ_ONLY_PROPERTY(TYPE, NAME)                                                                                                                      \
    TYPE NAME() const                                                                                                                                          \
    {                                                                                                                                                          \
        return m_kwinImpl->property(#NAME).value<TYPE>();                                                                                                      \
    }

#define BI_PROPERTY(TYPE, NAME, SETTER_NAME)                                                                                                                   \
    BI_READ_ONLY_PROPERTY(TYPE, NAME)                                                                                                                          \
                                                                                                                                                               \
    void SETTER_NAME(const TYPE &value)                                                                                                                        \
    {                                                                                                                                                          \
        m_kwinImpl->setProperty(#NAME, QVariant::fromValue(value));                                                                                            \
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
