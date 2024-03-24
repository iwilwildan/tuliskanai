import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const userSystemEnum = pgEnum('user_system_enum', ['system', 'user']);

export const files = pgTable('files', {
  id: serial('id').primaryKey(),
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url').notNull(),
  fileKey: text('file_key').notNull(),
  documentId: integer('document_id')
    .references(() => documents.id)
    .notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  documentKey: text('document_key').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  userId: varchar('user_id', { length: 256 }).notNull(),
});

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id')
    .references(() => documents.id)
    .notNull(),
  content: text('content').notNull(),
  role: userSystemEnum('role').notNull(),
});

export const $notes = pgTable('notes', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id')
    .references(() => documents.id)
    .notNull(),
  content: text('content'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const $template = pgTable('template', {
  id: serial('id').primaryKey(),
  templateName: text('template_name').notNull(),
  content: text('content'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const $userBalance = pgTable('user_balance', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 256 }).notNull(),
  planId: integer('plan_id').$default(() => 1),
  creditBalance: integer('credit_balance')
    .notNull()
    .$default(() => 10),
});

export const transaction = pgTable('transaction', {
  id: serial('id').primaryKey(),
  paymentId: varchar('payment_id', { length: 256 }).notNull(),
  userBalanceId: integer('user_balance_id')
    .references(() => $userBalance.id)
    .notNull(),
  amount: integer('amount'),
  credits: integer('credits'),
  plan: text('plan'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type File = typeof files.$inferInsert;
export type Note = typeof $notes.$inferInsert;
export type DrizzleDocument = typeof documents.$inferSelect;
export type UserBalance = typeof $userBalance.$inferInsert;
