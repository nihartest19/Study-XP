import { useState } from "react";
import { useGetSubjects, useCreateSubject, getGetSubjectsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Plus, Palette } from "lucide-react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const subjectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().min(4, "Color is required")
});

const COLORS = [
  "hsl(250 85% 60%)", // Primary
  "hsl(340 70% 65%)", // Pink
  "hsl(10 80% 60%)",  // Orange
  "hsl(40 95% 55%)",  // Yellow
  "hsl(150 70% 50%)", // Green
  "hsl(200 80% 60%)", // Light Blue
  "hsl(280 80% 65%)", // Purple
];

export default function Subjects() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const { data: subjects, isLoading } = useGetSubjects();
  const createSubject = useCreateSubject();

  const form = useForm<z.infer<typeof subjectSchema>>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: "",
      color: COLORS[0]
    }
  });

  const onSubmit = (data: z.infer<typeof subjectSchema>) => {
    createSubject.mutate({ data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetSubjectsQueryKey() });
        setIsOpen(false);
        form.reset();
        toast({ title: "Subject created!", description: "Ready for new quests." });
      }
    });
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Study Subjects</h1>
          <p className="text-muted-foreground">Organize your quests by category.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="font-bold gap-2" data-testid="button-create-subject">
              <Plus className="w-4 h-4" /> New Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Subject</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Mathematics..." {...field} data-testid="input-subject-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color Theme</FormLabel>
                      <FormControl>
                        <div className="flex flex-wrap gap-3">
                          {COLORS.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => field.onChange(c)}
                              className={`w-10 h-10 rounded-full border-2 transition-transform ${
                                field.value === c ? 'scale-110 border-foreground shadow-md' : 'border-transparent hover:scale-105'
                              }`}
                              style={{ backgroundColor: c }}
                              data-testid={`color-select-${c}`}
                            />
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit" disabled={createSubject.isPending} data-testid="button-submit-subject">
                    {createSubject.isPending ? "Creating..." : "Create Subject"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : subjects?.length === 0 ? (
        <div className="text-center p-12 border border-dashed rounded-xl bg-muted/10">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No subjects yet</h3>
          <p className="text-sm text-muted-foreground mt-1">Create subjects to organize your study tasks.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {subjects?.map((subject, i) => (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="overflow-hidden hover-elevate transition-all border-l-4" style={{ borderLeftColor: subject.color }}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg mb-1">{subject.name}</h3>
                      <p className="text-sm text-muted-foreground font-medium">
                        {subject.taskCount} {subject.taskCount === 1 ? 'Quest' : 'Quests'} Total
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center opacity-20" style={{ backgroundColor: subject.color, color: subject.color }}>
                      <Palette className="w-5 h-5 fill-current mix-blend-multiply" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
