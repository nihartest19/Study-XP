import { useState } from "react";
import { 
  useGetTasks, 
  useCreateTask, 
  useUpdateTask, 
  useDeleteTask, 
  useGetSubjects,
  getGetTasksQueryKey,
  getGetStatsQueryKey,
  getGetProfileQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Calendar, Star, ShieldAlert, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  priority: z.enum(["low", "medium", "high"]),
  subjectId: z.string().optional().transform(v => v ? parseInt(v) : undefined),
  xpReward: z.coerce.number().min(10).max(500).default(50)
});

export default function Tasks() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("active");

  const { data: tasks, isLoading: tasksLoading } = useGetTasks();
  const { data: subjects, isLoading: subjectsLoading } = useGetSubjects();

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      priority: "medium",
      xpReward: 50
    }
  });

  const onSubmit = (data: z.infer<typeof taskSchema>) => {
    createTask.mutate({ data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetTasksQueryKey() });
        setIsCreateOpen(false);
        form.reset();
        toast({ title: "Quest added!", description: "A new challenge awaits." });
      }
    });
  };

  const handleComplete = (id: number, completed: boolean) => {
    updateTask.mutate({ id, data: { completed } }, {
      onSuccess: (result) => {
        queryClient.invalidateQueries({ queryKey: getGetTasksQueryKey() });
        
        if (completed) {
          queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
          
          if (result.xpAwarded > 0) {
            toast({
              title: "Quest Completed!",
              description: `+${result.xpAwarded} XP Earned!`,
              className: "bg-secondary text-secondary-foreground border-secondary-border",
              action: <Star className="w-6 h-6 fill-current text-yellow-100" />
            });
          }

          if (result.newBadges && result.newBadges.length > 0) {
            setTimeout(() => {
              result.newBadges.forEach(badge => {
                toast({
                  title: "Badge Unlocked!",
                  description: badge.name,
                  className: "bg-primary text-primary-foreground border-primary-border",
                  action: <Award className="w-6 h-6" />
                });
              });
            }, 1000);
          }
        }
      }
    });
  };

  const handleDelete = (id: number) => {
    deleteTask.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetTasksQueryKey() });
        toast({ title: "Quest abandoned." });
      }
    });
  };

  const filteredTasks = tasks?.filter(t => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Active Quests</h1>
          <p className="text-muted-foreground">Complete tasks to earn XP and level up.</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="font-bold gap-2" data-testid="button-create-task">
              <Plus className="w-4 h-4" /> Add Quest
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Quest</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quest Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Read chapter 4..." {...field} data-testid="input-task-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-priority">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="xpReward"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>XP Reward</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} data-testid="input-task-xp" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="subjectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value?.toString() || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-subject">
                            <SelectValue placeholder="No Subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No Subject</SelectItem>
                          {subjects?.map(s => (
                            <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit" disabled={createTask.isPending} data-testid="button-submit-task">
                    {createTask.isPending ? "Creating..." : "Create Quest"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2 border-b border-border pb-4">
        {(["active", "completed", "all"] as const).map(f => (
          <Button
            key={f}
            variant={filter === f ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter(f)}
            className="capitalize rounded-full px-4"
            data-testid={`button-filter-${f}`}
          >
            {f}
          </Button>
        ))}
      </div>

      {tasksLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center p-12 border border-dashed rounded-xl bg-muted/10">
          <ShieldAlert className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No quests found</h3>
          <p className="text-sm text-muted-foreground mt-1">Enjoy your rest, hero. Or create a new quest!</p>
        </div>
      ) : (
        <motion.div className="space-y-3" layout>
          <AnimatePresence>
            {filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card className={`group transition-all duration-200 border-l-4 ${
                  task.completed ? 'opacity-60 border-l-muted' : 
                  task.priority === 'high' ? 'border-l-destructive hover:border-l-destructive shadow-sm' : 
                  task.priority === 'medium' ? 'border-l-secondary hover:border-l-secondary shadow-sm' : 
                  'border-l-primary hover:border-l-primary shadow-sm'
                }`}>
                  <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4 w-full sm:w-auto flex-1">
                      <Checkbox 
                        checked={task.completed}
                        onCheckedChange={(c) => handleComplete(task.id, !!c)}
                        className="w-6 h-6 rounded-full data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                        data-testid={`checkbox-task-${task.id}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-base truncate ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {task.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {task.subjectName && (
                            <Badge variant="outline" className="text-xs bg-muted/30 font-normal px-2 py-0 h-5" style={task.subjectColor ? { borderColor: task.subjectColor, color: task.subjectColor } : {}}>
                              {task.subjectName}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono font-medium">
                            <Star className="w-3 h-3 text-secondary fill-current" />
                            {task.xpReward} XP
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end mt-2 sm:mt-0">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full h-8 w-8"
                        onClick={() => handleDelete(task.id)}
                        data-testid={`button-delete-${task.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
