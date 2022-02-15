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
