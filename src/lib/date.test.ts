import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  DEFAULT_TIME_ZONE,
  addDays,
  addMonths,
  compareDates,
  diffInDays,
  endOfDay,
  endOfMonth,
  formatDate,
  isFuture,
  isPast,
  isSameDay,
  isValidDate,
  parseDate,
  startOfDay,
  startOfMonth,
  subDays,
} from "./date"

// 21h30 de 22/11/2026 em São Paulo. Em UTC já é 00h30 do dia 23: é a hora
// em que um modelo de datas em UTC troca o dia de quem está no Brasil.
const EVENING = new Date("2026-11-23T00:30:00.000Z")

describe("fuso padrão", () => {
  it("é o de São Paulo", () => {
    expect(DEFAULT_TIME_ZONE).toBe("America/Sao_Paulo")
  })
})

describe("formatDate", () => {
  it("formats brl by default", () => {
    expect(formatDate("2024-01-15")).toBe("15/01/2024")
  })

  it("formats us", () => {
    expect(formatDate("2024-01-15", "us")).toBe("2024-01-15")
  })

  it("returns empty string for null/undefined/invalid", () => {
    expect(formatDate(null)).toBe("")
    expect(formatDate(undefined)).toBe("")
    expect(formatDate("not-a-date")).toBe("")
    expect(formatDate("")).toBe("")
  })

  describe("data pura", () => {
    it("sai no mesmo dia em qualquer fuso", () => {
      for (const timeZone of [
        "America/Sao_Paulo",
        "UTC",
        "America/Los_Angeles",
        "Asia/Tokyo",
        "Pacific/Kiritimati",
        "Pacific/Pago_Pago",
      ]) {
        expect(formatDate("2024-01-15", "brl", timeZone)).toBe("15/01/2024")
        expect(formatDate("2024-01-15", "us", timeZone)).toBe("2024-01-15")
      }
    })

    it("não tem hora: mostra 00:00", () => {
      expect(formatDate("2024-01-15", "brl-full")).toBe("15/01/2024 00:00")
      expect(formatDate("2024-01-15", "time")).toBe("00:00")
    })

    it("um dia que não existe é inválido", () => {
      expect(formatDate("2024-02-31")).toBe("")
      expect(formatDate("2023-02-29")).toBe("")
      expect(formatDate("2024-13-01")).toBe("")
    })
  })

  describe("instante", () => {
    // Regressão: tudo era formatado em UTC, e 23h30 de 15/01 em Brasília
    // aparecia como "16/01/2024 02:30".
    it("mostra o dia e a hora de São Paulo", () => {
      expect(formatDate("2024-01-15T23:30:00-03:00", "brl-full")).toBe("15/01/2024 23:30")
      expect(formatDate("2024-01-15T23:30:00-03:00")).toBe("15/01/2024")
      expect(formatDate("2024-01-15T23:30:00-03:00", "us")).toBe("2024-01-15")
      expect(formatDate("2024-01-15T23:30:00-03:00", "time")).toBe("23:30")
    })

    it("converte de UTC para São Paulo", () => {
      expect(formatDate("2024-01-15T14:30:00.000Z", "brl-full")).toBe("15/01/2024 11:30")
      expect(formatDate("2024-01-15T09:05:00.000Z", "time")).toBe("06:05")
      // Duas da manhã em UTC ainda é a noite anterior em São Paulo.
      expect(formatDate("2024-01-16T02:30:00.000Z", "brl-full")).toBe("15/01/2024 23:30")
    })

    it("um Date das 21h30 de 22/11 em São Paulo é dia 22", () => {
      expect(formatDate(EVENING, "us")).toBe("2026-11-22")
      expect(formatDate(EVENING, "brl-full")).toBe("22/11/2026 21:30")
    })

    it("aceita outro fuso", () => {
      expect(formatDate("2024-01-15T14:30:00.000Z", "brl-full", "UTC")).toBe("15/01/2024 14:30")
      expect(formatDate("2024-01-15T09:05:00.000Z", "time", "UTC")).toBe("09:05")
      expect(formatDate(EVENING, "us", "UTC")).toBe("2026-11-23")
      expect(formatDate("2024-01-15T14:30:00.000Z", "brl-full", "Asia/Tokyo")).toBe(
        "15/01/2024 23:30",
      )
    })

    it("usa o horário de verão dos anos em que ele existiu", () => {
      // Janeiro de 2018: São Paulo estava em UTC-2.
      expect(formatDate("2018-01-15T14:30:00.000Z", "brl-full")).toBe("15/01/2018 12:30")
      // Julho de 2018: UTC-3.
      expect(formatDate("2018-07-15T14:30:00.000Z", "brl-full")).toBe("15/07/2018 11:30")
    })

    it("iso devolve o instante em UTC", () => {
      expect(formatDate("2024-01-15T23:30:00-03:00", "iso")).toBe("2024-01-16T02:30:00.000Z")
      expect(formatDate(EVENING, "iso")).toBe("2026-11-23T00:30:00.000Z")
    })
  })

  describe("data e hora sem deslocamento", () => {
    it("é o relógio da parede: sai como entrou", () => {
      expect(formatDate("2024-01-15T14:30:00", "brl-full")).toBe("15/01/2024 14:30")
      expect(formatDate("2024-01-15T14:30", "brl-full")).toBe("15/01/2024 14:30")
      expect(formatDate("2024-01-15 14:30:59.123", "brl-full")).toBe("15/01/2024 14:30")
      expect(formatDate("2024-01-15T14:30:00", "brl-full", "Asia/Tokyo")).toBe("15/01/2024 14:30")
    })

    it("hora que não existe é inválida", () => {
      expect(formatDate("2024-01-15T24:30:00")).toBe("")
      expect(formatDate("2024-01-15T10:61:00")).toBe("")
    })
  })
})

describe("parseDate", () => {
  // Regressão: a hora era gravada como UTC, e parseDate("2024-01-15", "14:30")
  // era 11h30 em Brasília.
  it("a hora é a do relógio de São Paulo", () => {
    expect(parseDate("2024-01-15", "14:30").toISOString()).toBe("2024-01-15T17:30:00.000Z")
    expect(formatDate(parseDate("2024-01-15", "14:30"), "brl-full")).toBe("15/01/2024 14:30")
  })

  it("sem hora, é a meia-noite daquele dia em São Paulo", () => {
    expect(parseDate("2024-01-15").toISOString()).toBe("2024-01-15T03:00:00.000Z")
  })

  it("vai e volta sem trocar o dia", () => {
    expect(formatDate(parseDate("2024-01-15"))).toBe("15/01/2024")
    expect(formatDate(parseDate("2024-12-31", "23:59"), "brl-full")).toBe("31/12/2024 23:59")
  })

  it("aceita segundos", () => {
    expect(parseDate("2024-01-15", "14:30:15").toISOString()).toBe("2024-01-15T17:30:15.000Z")
  })

  it("aceita outro fuso", () => {
    expect(parseDate("2024-01-15", undefined, "UTC").toISOString()).toBe("2024-01-15T00:00:00.000Z")
    expect(parseDate("2024-01-15", "14:30", "UTC").toISOString()).toBe("2024-01-15T14:30:00.000Z")
  })

  it("usa o horário de verão dos anos em que ele existiu", () => {
    expect(parseDate("2018-01-15", "12:00").toISOString()).toBe("2018-01-15T14:00:00.000Z")
    expect(parseDate("2018-07-15", "12:00").toISOString()).toBe("2018-07-15T15:00:00.000Z")
  })

  it("na hora que o relógio pulou, fica com a de depois do pulo", () => {
    // 04/11/2018: à meia-noite o relógio de São Paulo foi direto para 01:00.
    expect(parseDate("2018-11-04", "00:30").toISOString()).toBe("2018-11-04T03:30:00.000Z")
    expect(formatDate(parseDate("2018-11-04", "00:30"), "brl-full")).toBe("04/11/2018 01:30")
  })

  it("data inválida dá um Date inválido", () => {
    expect(Number.isNaN(parseDate("2024-02-31").getTime())).toBe(true)
    expect(Number.isNaN(parseDate("nada").getTime())).toBe(true)
  })
})

describe("isValidDate", () => {
  it("returns true for valid Date", () => {
    expect(isValidDate(new Date("2024-01-15"))).toBe(true)
  })

  it("returns true for valid date string", () => {
    expect(isValidDate("2024-01-15")).toBe(true)
    expect(isValidDate("2024-01-15T14:30:00-03:00")).toBe(true)
    expect(isValidDate("2024-01-15T14:30")).toBe(true)
  })

  it("returns false for null/undefined", () => {
    expect(isValidDate(null)).toBe(false)
    expect(isValidDate(undefined)).toBe(false)
  })

  it("returns false for invalid date", () => {
    expect(isValidDate("not-a-date")).toBe(false)
    expect(isValidDate("2024-02-31")).toBe(false)
    expect(isValidDate(new Date(Number.NaN))).toBe(false)
  })
})

describe("addDays / subDays", () => {
  it("adds days correctly", () => {
    const result = addDays("2024-01-15T00:00:00.000Z", 5)
    expect(result.toISOString()).toBe("2024-01-20T00:00:00.000Z")
  })

  it("subtracts days correctly", () => {
    const result = subDays("2024-01-15T00:00:00.000Z", 5)
    expect(result.toISOString()).toBe("2024-01-10T00:00:00.000Z")
  })

  it("com data pura, o resultado é o dia seguinte no calendário", () => {
    expect(formatDate(addDays("2024-01-31", 1))).toBe("01/02/2024")
    expect(formatDate(addDays("2024-02-28", 1))).toBe("29/02/2024")
    expect(formatDate(subDays("2024-03-01", 1))).toBe("29/02/2024")
    expect(formatDate(addDays("2024-12-31", 1))).toBe("01/01/2025")
  })

  it("atravessa uma virada de horário de verão sem trocar o dia", () => {
    // Em 18/02/2018 o dia teve 25 horas em São Paulo: somar 24h cairia às 23h do dia 17.
    expect(formatDate(addDays("2018-02-17", 1))).toBe("18/02/2018")
    expect(formatDate(addDays("2018-02-17", 2))).toBe("19/02/2018")
    // Em 04/11/2018 o dia teve 23 horas.
    expect(formatDate(addDays("2018-11-03", 1), "brl-full")).toBe("04/11/2018 01:00")
    expect(formatDate(addDays("2018-11-03", 2))).toBe("05/11/2018")
  })

  it("aceita fração de dia", () => {
    expect(addDays("2024-01-15T00:00:00.000Z", 0.5).toISOString()).toBe("2024-01-15T12:00:00.000Z")
    expect(addDays("2024-01-15T00:00:00.000Z", 1.5).toISOString()).toBe("2024-01-16T12:00:00.000Z")
  })

  it("data inválida continua inválida", () => {
    expect(Number.isNaN(addDays(null, 1).getTime())).toBe(true)
  })
})

describe("addMonths", () => {
  it("adds months correctly", () => {
    const result = addMonths("2024-01-15T00:00:00.000Z", 2)
    expect(result.getUTCMonth()).toBe(2)
    expect(result.getUTCFullYear()).toBe(2024)
  })

  it("rolls over to next year", () => {
    const result = addMonths("2024-11-01T00:00:00.000Z", 3)
    expect(result.getUTCFullYear()).toBe(2025)
    expect(result.getUTCMonth()).toBe(1)
  })

  // Regressão: 31/01 + 1 mês caía em 02/03 (o dia 31 estourava fevereiro) e a
  // parcela de fevereiro sumia do carnê.
  it("para no último dia do mês de destino quando o dia não existe nele", () => {
    expect(addMonths("2024-01-31", 1).toISOString().slice(0, 10)).toBe("2024-02-29")
    expect(addMonths("2023-01-31", 1).toISOString().slice(0, 10)).toBe("2023-02-28")
    expect(addMonths("2024-08-31", 6).toISOString().slice(0, 10)).toBe("2025-02-28")
    expect(addMonths("2024-03-31", 1).toISOString().slice(0, 10)).toBe("2024-04-30")
    expect(addMonths("2024-01-30", 1).toISOString().slice(0, 10)).toBe("2024-02-29")
    expect(addMonths("2024-01-29", 1).toISOString().slice(0, 10)).toBe("2024-02-29")
  })

  it("subtrai meses com o mesmo limite", () => {
    expect(addMonths("2024-03-31", -1).toISOString().slice(0, 10)).toBe("2024-02-29")
    expect(addMonths("2024-01-31", -2).toISOString().slice(0, 10)).toBe("2023-11-30")
  })

  it("mantém o dia quando o mês de destino tem esse dia", () => {
    expect(addMonths("2024-01-31", 2).toISOString().slice(0, 10)).toBe("2024-03-31")
    expect(addMonths("2024-02-29", 12).toISOString().slice(0, 10)).toBe("2025-02-28")
    expect(addMonths("2024-05-15", 0).toISOString().slice(0, 10)).toBe("2024-05-15")
  })

  it("gera doze parcelas mensais a partir da data base sem pular mês", () => {
    const vencimentos = Array.from({ length: 12 }, (_, i) =>
      formatDate(addMonths("2024-01-31", i), "us"),
    )
    expect(vencimentos).toEqual([
      "2024-01-31",
      "2024-02-29",
      "2024-03-31",
      "2024-04-30",
      "2024-05-31",
      "2024-06-30",
      "2024-07-31",
      "2024-08-31",
      "2024-09-30",
      "2024-10-31",
      "2024-11-30",
      "2024-12-31",
    ])
  })

  it("preserva a hora do dia", () => {
    expect(addMonths("2024-01-31T14:30:00.000Z", 1).toISOString()).toBe("2024-02-29T14:30:00.000Z")
  })

  it("o resultado formatado é o dia certo mesmo com horário de verão no meio", () => {
    // 31/01/2018 (UTC-2) + 1 mês = 28/02/2018 (UTC-3): em UTC puro cairia às 23h do dia 27.
    expect(formatDate(addMonths("2018-01-31", 1))).toBe("28/02/2018")
    expect(formatDate(addMonths("2018-10-31", 1))).toBe("30/11/2018")
  })

  it("o dia do mês é o de São Paulo, não o de UTC", () => {
    // 31/01 às 22h em São Paulo já é 01/02 em UTC.
    expect(formatDate(addMonths("2024-01-31T22:00:00-03:00", 1), "brl-full")).toBe(
      "29/02/2024 22:00",
    )
  })
})

describe("compareDates", () => {
  it("returns negative when a < b", () => {
    expect(compareDates("2024-01-01", "2024-12-31")).toBeLessThan(0)
  })

  it("returns positive when a > b", () => {
    expect(compareDates("2024-12-31", "2024-01-01")).toBeGreaterThan(0)
  })

  it("returns 0 for equal dates", () => {
    expect(compareDates("2024-06-15T00:00:00.000Z", "2024-06-15T00:00:00.000Z")).toBe(0)
  })

  it("ordena uma lista de datas puras e instantes", () => {
    const dates = ["2024-03-10", "2024-01-15T10:00:00-03:00", "2024-02-01"]
    expect([...dates].sort(compareDates)).toEqual([
      "2024-01-15T10:00:00-03:00",
      "2024-02-01",
      "2024-03-10",
    ])
  })
})

describe("diffInDays", () => {
  it("computes positive diff", () => {
    expect(diffInDays("2024-01-10T00:00:00.000Z", "2024-01-01T00:00:00.000Z")).toBe(9)
  })

  it("computes negative diff", () => {
    expect(diffInDays("2024-01-01T00:00:00.000Z", "2024-01-10T00:00:00.000Z")).toBe(-9)
  })

  it("returns 0 for same date", () => {
    expect(diffInDays("2024-06-15", "2024-06-15")).toBe(0)
  })

  it("conta dias de calendário entre datas puras", () => {
    expect(diffInDays("2024-03-01", "2024-02-01")).toBe(29)
    // Com a virada de horário de verão no meio, o dia de 25 horas conta um.
    expect(diffInDays("2018-02-20", "2018-02-15")).toBe(5)
  })
})

describe("isSameDay", () => {
  it("returns false for different days", () => {
    expect(isSameDay("2024-01-15", "2024-01-16")).toBe(false)
  })

  it("duas datas puras iguais são o mesmo dia", () => {
    expect(isSameDay("2024-01-15", "2024-01-15")).toBe(true)
  })

  // Regressão: o dia comparado era o de UTC.
  it("às 21h30 de 22/11 em São Paulo ainda é dia 22", () => {
    expect(isSameDay(EVENING, "2026-11-22")).toBe(true)
    expect(isSameDay(EVENING, "2026-11-23")).toBe(false)
  })

  it("dois instantes do mesmo dia de São Paulo, em dias diferentes de UTC", () => {
    // 08h e 22h de 15/01 em São Paulo: 11h de 15/01 e 01h de 16/01 em UTC.
    expect(isSameDay("2024-01-15T11:00:00.000Z", "2024-01-16T01:00:00.000Z")).toBe(true)
    // 22h de 14/01 e 08h de 15/01 em São Paulo: os dois em 15/01 de UTC.
    expect(isSameDay("2024-01-15T01:00:00.000Z", "2024-01-15T11:00:00.000Z")).toBe(false)
  })

  it("aceita outro fuso", () => {
    expect(isSameDay("2024-01-15T00:00:00.000Z", "2024-01-15T23:59:59.999Z", "UTC")).toBe(true)
    expect(isSameDay(EVENING, "2026-11-23", "UTC")).toBe(true)
    expect(isSameDay(EVENING, "2026-11-22", "UTC")).toBe(false)
  })

  it("data inválida não é o mesmo dia de nada", () => {
    expect(isSameDay(null, null)).toBe(false)
    expect(isSameDay("2024-01-15", "nada")).toBe(false)
  })
})

describe("startOfDay / endOfDay", () => {
  it("são os limites do dia de São Paulo", () => {
    // 14h30 em UTC são 11h30 em São Paulo, no dia 15.
    expect(startOfDay("2024-06-15T14:30:00.000Z").toISOString()).toBe("2024-06-15T03:00:00.000Z")
    expect(endOfDay("2024-06-15T14:30:00.000Z").toISOString()).toBe("2024-06-16T02:59:59.999Z")
  })

  it("às 21h30 de 22/11 em São Paulo, o dia é o 22", () => {
    expect(formatDate(startOfDay(EVENING), "brl-full")).toBe("22/11/2026 00:00")
    expect(formatDate(endOfDay(EVENING), "brl-full")).toBe("22/11/2026 23:59")
    expect(startOfDay(EVENING).getTime()).toBeLessThan(EVENING.getTime())
    expect(endOfDay(EVENING).getTime()).toBeGreaterThan(EVENING.getTime())
  })

  it("de uma data pura, são os limites daquele dia", () => {
    expect(startOfDay("2024-06-15").toISOString()).toBe("2024-06-15T03:00:00.000Z")
    expect(endOfDay("2024-06-15").toISOString()).toBe("2024-06-16T02:59:59.999Z")
  })

  it("aceita outro fuso", () => {
    expect(startOfDay("2024-06-15T14:30:00.000Z", "UTC").toISOString()).toBe(
      "2024-06-15T00:00:00.000Z",
    )
    expect(endOfDay("2024-06-15T00:00:00.000Z", "UTC").toISOString()).toBe(
      "2024-06-15T23:59:59.999Z",
    )
  })

  it("data inválida dá um Date inválido", () => {
    expect(Number.isNaN(startOfDay(null).getTime())).toBe(true)
    expect(Number.isNaN(endOfDay("nada").getTime())).toBe(true)
  })
})

describe("startOfMonth / endOfMonth", () => {
  it("são os limites do mês de São Paulo", () => {
    expect(startOfMonth("2024-06-15T12:00:00.000Z").toISOString()).toBe("2024-06-01T03:00:00.000Z")
    expect(endOfMonth("2024-06-15T12:00:00.000Z").toISOString()).toBe("2024-07-01T02:59:59.999Z")
    expect(formatDate(endOfMonth("2024-02-10"), "brl-full")).toBe("29/02/2024 23:59")
    expect(formatDate(startOfMonth("2024-02-10"), "brl-full")).toBe("01/02/2024 00:00")
  })

  it("o último instante do mês em São Paulo ainda é daquele mês", () => {
    // 30/11 às 22h em São Paulo já é dezembro em UTC.
    const lateNovember = "2026-12-01T01:00:00.000Z"
    expect(formatDate(startOfMonth(lateNovember))).toBe("01/11/2026")
    expect(formatDate(endOfMonth(lateNovember))).toBe("30/11/2026")
  })

  it("aceita outro fuso", () => {
    expect(startOfMonth("2024-06-15T00:00:00.000Z", "UTC").toISOString()).toBe(
      "2024-06-01T00:00:00.000Z",
    )
    expect(endOfMonth("2024-06-15T00:00:00.000Z", "UTC").toISOString()).toBe(
      "2024-06-30T23:59:59.999Z",
    )
  })

  it("data inválida dá um Date inválido", () => {
    expect(Number.isNaN(startOfMonth(undefined).getTime())).toBe(true)
    expect(Number.isNaN(endOfMonth("nada").getTime())).toBe(true)
  })
})

describe("isPast / isFuture", () => {
  it("isPast returns true for old date", () => {
    expect(isPast("2000-01-01")).toBe(true)
  })

  it("isFuture returns true for far future date", () => {
    expect(isFuture("2099-12-31")).toBe(true)
  })

  describe("às 21h30 de 22/11/2026 em São Paulo", () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(EVENING)
    })
    afterEach(() => {
      vi.useRealTimers()
    })

    // Regressão: "2026-11-23" era lido como meia-noite em UTC (21h do dia 22
    // em São Paulo), e isPast dizia que amanhã já tinha passado.
    it("amanhã é futuro, não passado", () => {
      expect(isPast("2026-11-23")).toBe(false)
      expect(isFuture("2026-11-23")).toBe(true)
    })

    it("hoje não é passado nem futuro", () => {
      expect(isPast("2026-11-22")).toBe(false)
      expect(isFuture("2026-11-22")).toBe(false)
    })

    it("ontem é passado", () => {
      expect(isPast("2026-11-21")).toBe(true)
      expect(isFuture("2026-11-21")).toBe(false)
    })

    it("um instante é comparado com agora", () => {
      // Meia hora atrás.
      expect(isPast("2026-11-22T21:00:00-03:00")).toBe(true)
      expect(isFuture("2026-11-22T21:00:00-03:00")).toBe(false)
      // Daqui a meia hora.
      expect(isFuture("2026-11-22T22:00:00-03:00")).toBe(true)
      expect(isPast("2026-11-22T22:00:00-03:00")).toBe(false)
      expect(isPast(new Date(EVENING.getTime() - 1))).toBe(true)
      expect(isFuture(new Date(EVENING.getTime() + 1))).toBe(true)
    })

    it("data e hora sem deslocamento é o relógio de São Paulo", () => {
      expect(isPast("2026-11-22T21:29")).toBe(true)
      expect(isFuture("2026-11-22T21:31")).toBe(true)
    })

    it("em UTC, o dia de hoje já é o 23", () => {
      expect(isPast("2026-11-22", "UTC")).toBe(true)
      expect(isFuture("2026-11-23", "UTC")).toBe(false)
      expect(isFuture("2026-11-24", "UTC")).toBe(true)
    })

    it("data inválida não é passado nem futuro", () => {
      expect(isPast(null)).toBe(false)
      expect(isFuture("nada")).toBe(false)
    })
  })
})
