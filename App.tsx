import { StatusBar } from "expo-status-bar"
import React from "react"
import { StyleSheet, Text, View, Button, TextInput, Keyboard, ScrollView } from "react-native"

const INFERKIT_API_KEY = "c511bce2-f148-4560-9960-7479643888ce"
const GENERATOR_URL = "https://api.inferkit.com/v1/models/standard/generate"

export default function App() {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)
  const [prompt, setPrompt] = React.useState<string | null>(null)
  const [story, setStory] = React.useState<string | null>(null)

  const handleGenerate = async () => {
    Keyboard.dismiss()
    setStory(null)
    setIsLoading(true)
    try {
      const response = await fetch(GENERATOR_URL, {
        method: "POST",
        headers: { "Content-Type": "json", Authorization: `Bearer ${INFERKIT_API_KEY}` },
        body: JSON.stringify({ prompt: { text: prompt.trim() }, length: 200, startFromBeginning: true }),
      })
      const json = await response.json()
      setStory(json["data"]["text"])
    } catch (error) {
      setError(error)
    }
    setIsLoading(false)
  }

  const handleLoadMore = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(GENERATOR_URL, {
        method: "POST",
        headers: { "Content-Type": "json", Authorization: `Bearer ${INFERKIT_API_KEY}` },
        body: JSON.stringify({
          prompt: { text: story.trim().slice(story.length - 1000), isContinuation: true },
          length: 200,
        }),
      })
      const json = await response.json()
      setStory(story + json["data"]["text"])
    } catch (error) {
      console.log(error)
      setError(error)
    }
    setIsLoading(false)
  }

  return (
    <>
      <StatusBar style="auto" />
      <View style={styles.container}>
        <View>
          <TextInput
            style={{ width: 300, height: 40, borderColor: "gray", borderWidth: 1, paddingHorizontal: 10 }}
            onChangeText={setPrompt}
            value={prompt}
            placeholder="Start writing a story ..."
          />
          {isLoading ? (
            <Text style={{ marginTop: 10, fontSize: 16, textAlign: "center" }}>Loading ...</Text>
          ) : (
            <Button title="Generate story" onPress={() => handleGenerate()} disabled={isLoading || !prompt} />
          )}
        </View>
        <ScrollView
          style={{ height: 50, width: 300 }}
          directionalLockEnabled
          showsHorizontalScrollIndicator={false}
        >
          {error && <Text>{error}</Text>}
          {story && prompt && (
            <>
              <Text style={{ width: 300, marginTop: 30 }}>
                {prompt}
                {story}...
              </Text>
              <Button title="Load more ..." onPress={() => handleLoadMore()} disabled={isLoading} />
            </>
          )}
        </ScrollView>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
})
