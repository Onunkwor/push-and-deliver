import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useFieldArray } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Handlebars from "handlebars";
import Editor from "@monaco-editor/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, Mail, Save } from "lucide-react";
import { starterHTML } from "@/lib/utils";
import { useMutation } from "@apollo/client";
import {
  CREATE_NEW_EMAIL_TEMPLATE,
  UPDATE_EMAIL_TEMPLATE,
} from "@/graphql/mutations";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { GET_ALL_EMAIL_TEMPLATE } from "@/graphql/queries";
import useNotification from "@/hooks/useNotification";

const templateSchema = z.object({
  templateName: z.string().min(1),
  version: z.number().min(1),
  subject: z.string().min(1),
  bodyText: z.string().min(1),
  status: z.enum(["approved", "pending"]),
  body: z.string().min(1),
  variables: z.array(
    z.object({
      variableKey: z
        .string()
        .min(2, { message: "Variable key must be at least 2 characters." }),
      variableValue: z.string().optional(),
    })
  ),
});
interface TemplateFormProps {
  isEditing: boolean;
  template?: any;
}
type TemplateForm = z.infer<typeof templateSchema>;

const TemplateForm: React.FC<TemplateFormProps> = (props) => {
  const { success, error } = useNotification();
  const navigate = useNavigate();
  const [preview, setPreview] = useState(true);
  const { user } = useUser();
  const [createNewEmailTemplate, { loading }] = useMutation(
    CREATE_NEW_EMAIL_TEMPLATE
  );
  const [updateEmailTemplate, { loading: isUpdating }] = useMutation(
    UPDATE_EMAIL_TEMPLATE,
    {
      refetchQueries: [{ query: GET_ALL_EMAIL_TEMPLATE }],
    }
  );
  const template = props?.template;
  const form = useForm<TemplateForm>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      templateName: template?.templateName || "",
      version: template?.version || 1,
      subject: template?.subject || "",
      bodyText: template?.bodyText || "",
      status: template?.status || "pending",
      body: template?.body || starterHTML,
      variables: template?.variables?.map((v: string) => ({
        variableKey: v,
        variableValue: "",
      })) || [
        {
          variableKey: "",
          variableValue: "",
        },
      ],
    },
  });
  const { isValid, isSubmitting } = form.formState;
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variables",
  });
  let parsedHtml = "";

  try {
    const watchedBody = form.watch("body");
    const previewData = form.watch("variables")?.reduce((acc, curr) => {
      if (curr.variableKey) {
        const cleanKey = curr.variableKey.replace(/[{}]/g, "");
        acc[cleanKey] = curr.variableValue ?? "";
      }
      return acc;
    }, {} as Record<string, string>);

    const template = Handlebars.compile(watchedBody || "");
    parsedHtml = template(previewData);
  } catch (err: any) {
    console.error("Template parse/render error:", err);

    parsedHtml = `
          <div style="color:red; font-family:monospace;">
            <strong>Template Error:</strong><br />
            ${err.message}
          </div>
        `;
  }

  const onSubmit = async (data: TemplateForm) => {
    try {
      const payload = {
        templateName: data.templateName,
        version: data.version,
        subject: data.subject,
        body: data.body,
        bodyText: data.bodyText,
        variables: data.variables.map((v) => v.variableKey),
        status: data.status,
      };

      if (template?.id) {
        await updateEmailTemplate({
          variables: {
            input: {
              id: template.id,
              ...payload,
              updatedBy: user?.id,
            },
          },
        });
        success("Template updated successfully");
      } else {
        await createNewEmailTemplate({
          variables: {
            input: {
              ...payload,
              createdBy: user?.id,
            },
          },
        });
        form.reset();
        success("Template created successfully");
      }

      navigate("/email-templates/templates");
    } catch (err) {
      console.log(err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === "string"
          ? err
          : "Unknown error";
      error(`Something went wrong: ${errorMessage}`);
    }
  };
  console.log(template);

  return (
    <div className="p-6 w-full">
      {props.isEditing && (
        <div className="flex items-center mb-6 gap-x-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-black transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Templates
          </button>
        </div>
      )}
      <Card className="mb-6 w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">
                {props.isEditing
                  ? `Edit ${template.templateName}`
                  : " Create Email Template"}
              </CardTitle>
              <CardDescription>
                {props.isEditing
                  ? "Modify email template"
                  : " Create email template"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="flex gap-6 w-full">
        <div className={`${preview ? "w-1/2" : "w-full"}`}>
          <Tabs
            defaultValue="edit"
            className="w-full"
            // onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="edit">Template Details</TabsTrigger>
              <TabsTrigger value="content">Email Content</TabsTrigger>
              <TabsTrigger value="variables">Variables</TabsTrigger>
            </TabsList>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <TabsContent value="edit" className="space-y-4 mt-4 ">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Template Name */}
                    <FormField
                      control={form.control}
                      name="templateName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Template Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="event-creation" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Version */}
                    <FormField
                      control={form.control}
                      name="version"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Version</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Subject */}
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Subject</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Passwave: You bought this ticket from us!"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Plain-Text Body */}

                  <FormField
                    control={form.control}
                    name="bodyText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Body Text</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Please find your ticket in the attached PDF."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="content" className="mt-4">
                  <div className="border rounded-md overflow-hidden mb-4 w-full">
                    <div className="bg-gray-100 p-3 border-b flex items-center">
                      <Mail className="h-5 w-5 mr-2 text-gray-500" />
                      <span className="font-medium">HTML Editor</span>
                    </div>
                    <FormField
                      control={form.control}
                      name="body"
                      render={({ field }) => (
                        <>
                          <div className="flex h-screen">
                            <FormItem className="w-full border-r border-gray-700">
                              <FormControl>
                                <Editor
                                  height="100%"
                                  language="handlebars"
                                  theme="vs-dark"
                                  value={field.value}
                                  onChange={(v) => field.onChange(v || "")}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          </div>
                        </>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="variables" className="space-y-4 mt-4">
                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">
                          Preview Variables
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {fields.map((field, index) => (
                          <div
                            key={field.id}
                            className="grid grid-cols-4 gap-2"
                          >
                            <div className="col-span-1 font-mono text-xs">
                              <FormLabel className="pb-1">
                                Variable Key
                              </FormLabel>
                              <FormField
                                control={form.control}
                                name={`variables.${index}.variableKey`}
                                render={({ field }) => (
                                  <Input
                                    placeholder="e.g. userName"
                                    {...field}
                                    className="h-8 text-sm"
                                  />
                                )}
                              />
                            </div>
                            <div className="col-span-2 font-mono text-xs">
                              <FormLabel className="pb-1">
                                Variable Value
                              </FormLabel>
                              <FormField
                                control={form.control}
                                name={`variables.${index}.variableValue`}
                                render={({ field }) => (
                                  <Input
                                    placeholder="e.g. Jane"
                                    {...field}
                                    className="h-8 text-sm"
                                  />
                                )}
                              />
                            </div>
                            <div className="pt-4">
                              <Button
                                type="button"
                                variant="destructive"
                                className="h-8 px-2"
                                onClick={() => remove(index)}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-2"
                      onClick={() =>
                        append({ variableKey: "", variableValue: "" })
                      }
                    >
                      + Add Variable
                    </Button>
                  </div>
                </TabsContent>

                <div className="mt-6 flex justify-between">
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => setPreview((prev) => !prev)}
                    >
                      {preview ? (
                        <EyeOff className="mr-1 h-4 w-4" />
                      ) : (
                        <Eye className="mr-1 h-4 w-4" />
                      )}
                      {preview ? "Hide Preview" : " Preview"}
                    </Button>
                    <Button
                      type="submit"
                      className="bg-[#ff9800] hover:bg-[#ff9800]/80 disabled:opacity-70"
                      disabled={!isValid || isSubmitting || isUpdating}
                    >
                      <Save className="mr-1 h-4 w-4" />
                      {isSubmitting || isUpdating || loading
                        ? props.isEditing
                          ? "Updating..."
                          : "Saving..."
                        : props.isEditing
                        ? "Update Template"
                        : "Save Template"}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </Tabs>
        </div>

        {preview && (
          <div className="w-1/2 transform transition-all">
            <Card className="sticky top-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium">
                  Email Preview
                </CardTitle>
                <CardDescription>
                  How your email will appear to recipients
                </CardDescription>
              </CardHeader>
              <CardContent className="border-t pt-4 w-full">
                <div className="bg-white rounded-md border p-4 min-h-96 overflow-auto w-full">
                  <div className="text-sm text-gray-500 pb-2 border-b mb-3">
                    <div className="flex justify-between">
                      <span>From: Passwave</span>
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="mt-1">To: Raphael Onunkwor</div>
                    <div className="font-medium mt-1">
                      Subject: {form.watch("subject")}
                    </div>
                  </div>

                  <div className="p-4 overflow-auto w-full">
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: parsedHtml }}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between text-xs text-gray-500">
                <span>Last updated: {new Date().toLocaleDateString()}</span>
                <span>Preview mode</span>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateForm;
