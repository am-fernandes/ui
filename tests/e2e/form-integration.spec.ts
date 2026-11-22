import { expect, test } from "@playwright/test"

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`

test.describe("Formulário com react-hook-form", () => {
  test("enviar vazio mostra as mensagens da lib, não o balão do navegador", async ({ page }) => {
    await page.goto(story("form-integration-rhf-form--default"))
    const form = page.locator("form")
    // noValidate é o que deixa a regra do react-hook-form chegar ao campo
    await expect(form).toHaveJSProperty("noValidate", true)

    await page.getByRole("button", { name: "Enviar" }).click()

    await expect(page.getByRole("alert")).toHaveText([
      "Informe o e-mail",
      "Selecione um estado",
      "Informe a data de nascimento",
      "Deve ser maior que zero",
      "Você precisa aceitar os termos",
    ])
    const email = page.getByLabel(/E-mail/)
    await expect(email).toHaveAttribute("aria-invalid", "true")
    await expect(email).toBeFocused()
  })

  test("corrigir um campo tira o erro só dele", async ({ page }) => {
    await page.goto(story("form-integration-rhf-form--default"))
    await page.getByRole("button", { name: "Enviar" }).click()
    await expect(page.getByText("Informe o e-mail")).toBeVisible()

    const email = page.getByLabel(/E-mail/)
    await email.fill("ana.souza@exemplo.com.br")
    await email.blur()

    await expect(page.getByText("Informe o e-mail")).toHaveCount(0)
    await expect(email).not.toHaveAttribute("aria-invalid", "true")
    await expect(page.getByText("Informe a data de nascimento")).toBeVisible()
  })

  test("e-mail malformado mostra a mensagem de formato", async ({ page }) => {
    await page.goto(story("form-integration-rhf-form--default"))
    const email = page.getByLabel(/E-mail/)
    await email.fill("ana@")
    await email.blur()
    await expect(page.getByText("Formato de e-mail inválido")).toBeVisible()
  })
})
