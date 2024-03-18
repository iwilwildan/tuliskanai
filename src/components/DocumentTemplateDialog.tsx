'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import toast from 'react-hot-toast';
import React, { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useNote } from './NoteProvider';

const FormSchema = z.object({
  title: z.string().min(10, {
    message: 'Title must be at least 10 characters.',
  }),
  template: z.enum(['1', '2'], {
    required_error: 'Please select a template.',
  }),
});
type Props = {};
type templateParams = {
  title: string;
  templateId: string;
  noteId: string;
};

const DocumentTemplateDialog = (props: Props) => {
  const [open, setOpen] = useState(false);
  const { note, updateNote } = useNote();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });
  const { isPending, mutate } = useMutation({
    mutationFn: async (data: templateParams) => {
      const response = await axios.post('/api/generate-note', {
        data,
      });
      return response.data;
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      if (note.id) {
        mutate(
          {
            noteId: note.id.toString(),
            title: data.title,
            templateId: data.template,
          },
          {
            onSuccess: (res) => {
              //console.log(res);
              updateNote({ ...note, content: res });
              setOpen(false);
              toast(`${data.template} dengan judul ${data.title} dituliskan`);
            },
            onError: (err) => {
              throw new Error(err.message);
            },
          }
        );
      }
    } catch (error) {
      console.log(error);
      toast.error('Gagal membuat tulisan');
    } finally {
      form.reset();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-green-400">
          Gunakan Template
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tuliskan judul se-spesifik mungkin"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="template"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Template</FormLabel>
                  <FormDescription>Pilih kerangka tulisanmu.</FormDescription>
                  <FormMessage />
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid max-w-md grid-cols-2 gap-8 pt-2"
                  >
                    <FormItem>
                      <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                        <FormControl>
                          <RadioGroupItem value="1" className="sr-only" />
                        </FormControl>
                        <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
                          <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
                            <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                              <div className="w-auto rounded-lg px-2 bg-[#ecedef]">
                                Introduction
                              </div>
                              <div className="w-auto rounded-lg px-2 bg-[#ecedef]" />
                            </div>
                            <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                              <div className="w-auto rounded-lg px-2 bg-[#ecedef]">
                                Body paragraphs
                              </div>
                              <div className="w-auto rounded-lg px-2 bg-[#ecedef]" />
                            </div>
                            <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                              <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                              <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                            </div>
                            <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                              <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                              <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                            </div>
                            <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                              <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                              <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                            </div>
                            <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                              <div className="w-auto rounded-lg px-2 bg-[#ecedef]">
                                Conclusion
                              </div>
                            </div>
                          </div>
                        </div>
                        <span className="block w-full p-2 text-center font-normal">
                          Essay
                        </span>
                      </FormLabel>
                    </FormItem>
                    <FormItem>
                      <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                        <FormControl>
                          <RadioGroupItem value="2" className="sr-only" />
                        </FormControl>
                        <div className="items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground">
                          <div className="space-y-2 rounded-sm bg-slate-950 p-2 text-white text-sm">
                            <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                              <div className="w-auto rounded-lg bg-slate-600 px-2">
                                Abstract
                              </div>
                              <div className="w-auto rounded-lg bg-slate-600 px-2">
                                Introduction
                              </div>
                            </div>
                            {/* <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                              <div className="h-4 w-4 rounded-full bg-slate-400" />
                              <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                            </div>
                            <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                              <div className="h-4 w-4 rounded-full bg-slate-400" />
                              <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                            </div> */}
                            <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                              <div className="w-auto rounded-lg bg-slate-600 px-2">
                                Literature Review
                              </div>
                              <div className="w-auto rounded-lg bg-slate-600 px-2">
                                Hypotheses
                              </div>
                              <div className="w-auto rounded-lg bg-slate-600 px-2">
                                Methodology
                              </div>
                              <div className="w-auto rounded-lg bg-slate-600 px-2">
                                Timeline
                              </div>
                            </div>
                            <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                              <div className="w-auto rounded-lg bg-slate-600 px-2">
                                References
                              </div>
                            </div>
                          </div>
                        </div>
                        <span className="block w-full p-2 text-center font-normal">
                          Proposal Penelitian
                        </span>
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Menuliskan...' : 'Tuliskan'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentTemplateDialog;
