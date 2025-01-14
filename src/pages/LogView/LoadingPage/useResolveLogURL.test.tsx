import { MockedProvider } from "@apollo/client/testing";
import { renderHook } from "@testing-library/react-hooks";
import { TestLogUrlQuery, TestLogUrlQueryVariables } from "gql/generated/types";
import { GET_TEST_LOG_URL } from "gql/queries";
import { ApolloMock } from "types/gql";
import { useResolveLogURL } from "./useResolveLogURL";

describe("useResolveLogURL", () => {
  it("resolves test log URLs from GraphQL resolver when data is available", async () => {
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <MockedProvider mocks={[getExistingTestLogURLMock]}>
        {children}
      </MockedProvider>
    );
    const { result, waitForNextUpdate } = renderHook(
      () =>
        useResolveLogURL({
          execution: "0",
          logType: "EVERGREEN_TEST_LOGS",
          taskID: "a-task-id",
          testID: "a-test-name",
        }),
      {
        wrapper,
      }
    );
    expect(result.current).toMatchObject({
      htmlLogURL: "",
      jobLogsURL: "",
      legacyJobLogsURL: "",
      loading: true,
      lobsterURL: "",
      rawLogURL: "",
    });
    await waitForNextUpdate();
    expect(result.current).toMatchObject({
      htmlLogURL: "htmlURL",
      jobLogsURL: "",
      legacyJobLogsURL: "",
      loading: false,
      lobsterURL: "lobsterURL",
      rawLogURL: "rawURL",
    });
  });

  it("generates test log URLs without GraphQL data when GraphQL data is empty", async () => {
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <MockedProvider mocks={[getEmptyTestLogURLMock]}>
        {children}
      </MockedProvider>
    );
    const { result, waitForNextUpdate } = renderHook(
      () =>
        useResolveLogURL({
          execution: "0",
          logType: "EVERGREEN_TEST_LOGS",
          taskID: "a-task-id",
          testID: "a-test-name-that-doesnt-exist",
        }),
      {
        wrapper,
      }
    );
    await waitForNextUpdate();
    expect(result.current).toMatchObject({
      htmlLogURL:
        "test-evergreen.com/test_log/a-task-id/0?test_name=a-test-name-that-doesnt-exist&text=false",
      jobLogsURL: "",
      legacyJobLogsURL: "",
      loading: false,
      lobsterURL:
        "undefined/evergreen/test/a-task-id/0/a-test-name-that-doesnt-exist",
      rawLogURL:
        "test-evergreen.com/test_log/a-task-id/0?test_name=a-test-name-that-doesnt-exist&text=true",
    });
  });
});

const getExistingTestLogURLMock: ApolloMock<
  TestLogUrlQuery,
  TestLogUrlQueryVariables
> = {
  request: {
    query: GET_TEST_LOG_URL,
    variables: {
      execution: 0,
      taskID: "a-task-id",
      testName: "^a-test-name$",
    },
  },
  result: {
    data: {
      task: {
        id: "taskID",
        tests: {
          testResults: [
            {
              id: "testID",
              logs: {
                url: "htmlURL",
                urlLobster: "lobsterURL",
                urlRaw: "rawURL",
              },
            },
          ],
        },
      },
    },
  },
};

const getEmptyTestLogURLMock: ApolloMock<
  TestLogUrlQuery,
  TestLogUrlQueryVariables
> = {
  request: {
    query: GET_TEST_LOG_URL,
    variables: {
      execution: 0,
      taskID: "a-task-id",
      testName: "^a-test-name$",
    },
  },
  result: {
    data: {
      task: {
        id: "taskID",
        tests: {
          testResults: [],
        },
      },
    },
  },
};
