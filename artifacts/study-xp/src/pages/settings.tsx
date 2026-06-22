import { useGetProfile, useUpdateProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings as SettingsIcon, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export default function Settings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: profile, isLoading } = useGetProfile();
  const updateProfile = useUpdateProfile();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
    }
  });

  // Reset form when profile data loads
  useEffect(() => {
    if (profile) {
      form.reset({ name: profile.name });
    }
  }, [profile, form]);

  const onSubmit = (data: z.infer<typeof profileSchema>) => {
    updateProfile.mutate({ data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
        toast({ title: "Profile updated successfully." });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-6">
        <Skeleton className="h-10 w-48 mb-4" />
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-primary" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">Manage your adventurer profile.</p>
      </div>

      <Card>
        <CardHeader className="border-b border-border bg-muted/30">
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Profile Information
          </CardTitle>
          <CardDescription>Update how you appear to others on your quests.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adventurer Name</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-profile-name" className="max-w-md" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" disabled={updateProfile.isPending || !form.formState.isDirty} data-testid="button-save-profile">
                {updateProfile.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
