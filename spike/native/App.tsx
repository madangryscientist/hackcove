/**
 * HC-192 spike screens: the Storybook stories of Button, Text, Card and Input, mirrored one for one
 * so the shots compare side by side. `?theme=<name>&page=a|b` picks the theme and page, on the web
 * from the URL and on Android from a deep link (exp://…/--/?theme=…&page=…).
 */
import { StatusBar } from "expo-status-bar";
import { useEffect, useState, type ReactNode } from "react";
import { Linking, Platform, Pressable, ScrollView, Text as RNText, View } from "react-native";
import {
  Button,
  Caption,
  Card,
  Input,
  Overline,
  PageHeading,
  SectionHeading,
  Stack,
  SubsectionHeading,
  Text,
} from "./src/hc/components";
import { THEMES, THEME_NAMES, ThemeProvider } from "./src/hc/theme";

type Route = { theme: string; page: "a" | "b" };
function parse(url: string | null | undefined): Route {
  const q = new URLSearchParams((url ?? "").split("?")[1] ?? "");
  const theme = q.get("theme") ?? "default";
  return { theme: theme in THEMES ? theme : "default", page: q.get("page") === "b" ? "b" : "a" };
}

function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() =>
    Platform.OS === "web" ? parse(window.location.href) : { theme: "default", page: "a" },
  );
  useEffect(() => {
    if (Platform.OS === "web") return;
    void Linking.getInitialURL().then((u) => u && setRoute(parse(u)));
    const sub = Linking.addEventListener("url", ({ url }) => setRoute(parse(url)));
    return () => sub.remove();
  }, []);
  return route;
}

/** One story, by its Storybook id: the label is the spike's own chrome, not ui. */
function Story({ id, children }: { id: string; children: ReactNode }) {
  return (
    <View testID={id} style={{ gap: 6 }}>
      <RNText style={{ fontSize: 10, color: "#888", fontFamily: "monospace" }}>{id}</RNText>
      <View testID={`${id}--body`} style={{ alignSelf: "stretch" }}>
        {children}
      </View>
    </View>
  );
}
const Row = ({ children }: { children: ReactNode }) => (
  <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
    {children}
  </View>
);

function PageA() {
  return (
    <>
      <Story id="actions-button--variants">
        <Row>
          <Button measure="Button.md">Save</Button>
          <Button variant="outline">Cancel</Button>
          <Button variant="ghost">Skip</Button>
          <Button variant="link">Edit</Button>
        </Row>
      </Story>
      <Story id="actions-button--sizes">
        <Row>
          {(["sm", "md", "lg"] as const).map((size) => (
            <Button key={size} size={size} measure={`Button.${size}`}>
              {`Save ${size}`}
            </Button>
          ))}
          {(["sm", "md", "lg"] as const).map((size) => (
            <Button key={size} size={size} variant="outline">
              {`Quotes ${size}`}
            </Button>
          ))}
        </Row>
      </Story>
      <Story id="actions-button--disabled">
        <View style={{ gap: 12 }}>
          {(["default", "positive", "danger"] as const).map((tone) => (
            <Row key={tone}>
              <Button tone={tone} disabled>
                Save
              </Button>
              <Button tone={tone} variant="outline" disabled>
                Cancel
              </Button>
              <Button tone={tone} variant="ghost" disabled>
                Skip
              </Button>
              <Button tone={tone} variant="link" disabled>
                Edit
              </Button>
            </Row>
          ))}
        </View>
      </Story>
      <Story id="text-headings--do-scale">
        <Stack gap="sm">
          <PageHeading>Quotes</PageHeading>
          <SectionHeading rule>Open</SectionHeading>
          <SubsectionHeading>Awaiting reply</SubsectionHeading>
          <Text>Three quotes are waiting on the customer.</Text>
        </Stack>
      </Story>
    </>
  );
}

function PageB() {
  return (
    <>
      <Story id="text-body-text--do-paragraph">
        <Stack gap="xs">
          <Text>
            Invoice <Text strong>INV-204</Text> is due on Friday.
          </Text>
          <Caption>Sent 2 minutes ago</Caption>
        </Stack>
      </Story>
      <Story id="text-body-text--do-meaning">
        <Stack gap="xs">
          <Text tone="positive">Saved.</Text>
          <Text tone="danger">Could not save: the name is taken.</Text>
        </Stack>
      </Story>
      <Story id="text-body-text--do-labels">
        <Stack gap="xs">
          <Overline>Billing</Overline>
          <SectionHeading>Invoices</SectionHeading>
        </Stack>
      </Story>
      <Story id="content-card--do-spacing">
        <Stack>
          <Card title="Open" count={3}>
            <Text color="muted">Three things to do.</Text>
          </Card>
          <Card title="Done" count={12}>
            <Text color="muted">Twelve things finished.</Text>
          </Card>
        </Stack>
      </Story>
      <Story id="forms-input--default">
        <Input placeholder="Your name" measure="Input.md" />
      </Story>
      <Story id="forms-input--small">
        <Input size="sm" placeholder="Qty" measure="Input.sm" />
      </Story>
      <Story id="forms-input--disabled">
        <Input placeholder="Your name" disabled />
      </Story>
    </>
  );
}

export default function App() {
  const route = useRoute();
  const [override, setOverride] = useState<Route | null>(null);
  const { theme, page } = override ?? route;
  const map = THEMES[theme]!;
  return (
    <ThemeProvider name={theme}>
      <View style={{ flex: 1, backgroundColor: map.base.backgroundColor ?? "#ffffff" }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 40, gap: 20 }}>
          <View testID="switcher" style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {THEME_NAMES.flatMap((t) =>
              (["a", "b"] as const).map((p) => (
                <Pressable key={`${t}${p}`} onPress={() => setOverride({ theme: t, page: p })}>
                  <RNText
                    style={{
                      fontSize: 10,
                      fontFamily: "monospace",
                      color: t === theme && p === page ? "#e11d48" : "#888",
                    }}
                  >
                    {`${t}/${p}`}
                  </RNText>
                </Pressable>
              )),
            )}
          </View>
          {page === "a" ? <PageA /> : <PageB />}
        </ScrollView>
        <StatusBar style={map.scheme === "dark" ? "light" : "dark"} />
      </View>
    </ThemeProvider>
  );
}
