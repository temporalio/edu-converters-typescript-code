# Exercise 1: Implement a Custom Data Converter

During this exercise, you will:

- Output typical payloads from a Temporal Workflow using the default Data Converter
- Implement a Custom Data Converter that encrypts Workflow output
- Implement a Failure Converter and demonstrate parsing its output
- Implement a Composite Data Converter that combines multiple conversion steps

Make your changes to the code in the `practice` subdirectory (look for
`TODO` comments that will guide you to where you should make changes to
the code). If you need a hint or want to verify your changes, look at
the complete version in the `solution` subdirectory.

## Setup

You'll need two terminal windows for this exercise.

1. In all terminals, change to the `exercises/custom-converter/practice` directory.
2. In one terminal, run `npm install` to install dependencies.

## Part A: Implement a Custom Data Converter

1. Defining a Custom Data Converter is a straightforward change to your existing
   Worker and Starter code. The example in the `practice` subdirectory of this
   exercise is missing the necessary change to use a Custom Data Converter,
   meaning that you can run it out of the box, and produce JSON output using the
   Default Data Converter. You'll do this first, so you have an idea of the
   expected output. First, start the Worker:

   ```shell
   npm run start
   ```

2. Next, run the Workflow starter:

   ```shell
   npm run workflow
   ```

3. You will see the Workflow fails with this error message: `TypeError: user.createdAt.getTime is not a function at getTime`. The reason that this Workflow fails is due to the serialization and deserialization process when passing data to and from Workflows in Temporal. When the User object is passed into the Workflow, the `createdAt` field, which is originally a Date object, is serialized into a string representation. As a result, when the Workflow attempts to invoke `.getTime()` on `user.createdAt`, it fails because the deserialized `createdAt` is now a string, not a Date object with a `.getTime` method.

We will fix this by using a Custom Converter.

4. Next, take a look in `ejson-payload-converter.ts`. This contains the Custom Converter
code you'll be using. The method `toPayload` returns a Payload object, which is used to manage and transport serialized data. The method `fromPayload` returns the deserialized data. In the `fromPayload` method, we want to decode the data so wrap the data with the `decode` function, which is already imported for you from `@temporalio/common`. Then take the decoded data and wrap it with `EJSON.parse()`. Now, we are returning deserialized data.

## Part B: Implement a Composite Data Converter

1. To be able to use this Custom Data Converter, you need to be able to register it with your Client and Worker. To do this, we will create a Composite Data Converter. A Composite Data Converter is used to apply custom, type-specific Payload Converters in a specified order. You can construct a Composite Data Converter that provides a set of rules in a custom order. For example, if you had something like this:

   ```typescript
   export const payloadConverter = new CompositePayloadConverter(
     new UndefinedPayloadConverter(),
     new BinaryPayloadConverter(),
     new EjsonPayloadConverter()
   );
   ```

Order is important. For example, first the `UndefinedPayloadConverter` will convert between JS `undefined` and `NULL` Payloads. Then, `BinaryPayloadConverter`
converts between binary data types and RAW Payloads. Finally, `EjsonPayloadConverter` will convert EJSON values.

You don't need to change anything in your Workflow code. You only need to add a path to your `payload-converter.ts` file to your Client and Worker code.

2. Now you can re-run the Workflow with your Custom Converter. Stop your Worker with `Ctrl+C` in a blocking terminal and restart it with `npm run start`, then re-run the Workflow with `npm run workflow`. Finally, get the result again with `temporal workflow show -w converters_workflowID`. Your output will be now be decoded:

```
...
Result:
Status: COMPLETED
Output: [{"success":true,"at":{"$date":1709061724717}}]
```

You have successfully implemented a Custom Data Converter, and in the next step, you'll
add more features to it.

## Part C: Implement a Failure Converter

1. The next feature you may add is a Failure Converter. Failure messages and stack traces are not encoded as codec-capable Payloads by default; you must explicitly enable encoding these common attributes on failures. If your errors might contain sensitive information, you can encrypt the message and stack trace by configuring the default Failure Converter to use your encoded attributes, in which case it moves your `message` and `stack_trace` fields to a Payload that's run through your codec. To do this, you can override the default Failure Converter with a single additional parameter,`EncodeCommonAttributes: true`. Make this change to `failure.ts`.

2. In your `failure-converter.ts` file, create a new instance of the `DefaultFailureConverter`.

3. Just like you did with `payload-converter.ts`, add the `failure-converter.ts` file to your Client and Worker code.

4. To test your Failure Converter, change your Activity to return an artificial
   error. In your Activity code, throw a non-retryable Application Failure error.

```typescript
export async function converterActivity(input: string): Promise<string> {
  const context = activity.Context.current();
  context.log.info("User is successfully logged", { input });
  ApplicationFailure.create({
    nonRetryable: true,
    message: `Activity failed:`,
  });
  return `Received ${input}`;
}
```

Next, try re-running your Workflow, and it should fail. 5. Run `temporal workflow show -w converters_workflowID` to get the status of your
failed Workflow. Notice that the `Failure:` field should now display an encoded
result, rather than a plain text error:

```
...
Status: FAILED
Failure: &Failure{Message:Encoded failure,Source:,StackTrace:,Cause:&Failure{Message:Encoded failure,Source:TypeScriptSDK,StackTrace:,Cause:nil,FailureType:Failure_ApplicationFailureInfo,},FailureType:Failure_ActivityFailureInfo,}
```

### This is the end of the exercise.
