'use server';

//выполнение Server Action
import { z } from 'zod';  //валидация данных введенных пользователем
import { sql } from '@vercel/postgres';   //для sql запросов в БД
import { revalidatePath } from 'next/cache';  //для очистки кеша и нового запроса данных с сервера
import { redirect } from 'next/navigation';   // для перенаправления пользователя на другую страницу

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoice.parse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    });
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];
    // Test it out:
    // console.log(rawFormData);
    // console.log(typeof rawFormData.amount);

    // вставка значений в БД
    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;

  revalidatePath('/dashboard/invoices');

  redirect('/dashboard/invoices');
  }