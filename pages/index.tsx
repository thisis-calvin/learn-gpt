import { useEffect, useState } from "react";
import { Box, Button, Flex, FormControl, FormLabel, Heading, Input, Text, Image, useDisclosure } from "@chakra-ui/react";
import axios from 'axios'
import QuizModal from "../components/Quiz.modal";
import { chatResponse } from "../utils/openai";
import Head from 'next/head'
import replicate from "../utils/replicate";

interface Response {
  image: [string],
  text: string
}

interface Questions {
  question: string,
  answer: string
}

export default function Home() {

  const [inputValue, setInputValue] = useState('');
  const [topic, setTopic] = useState<string | null>(null)
  const [response, setResponse] = useState<Response | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [questions, setQuestions] = useState<Array<Questions> | null>(null)

  const fetchQuiz = async () => {
    const textData: any = await chatResponse(`generate 5 basic question answers on ${inputValue} in JSON format with an array of question and answer objects.`)
    console.log(JSON.parse(textData).questions)
    setQuestions(JSON.parse(textData).questions)
  }

  const generateData = async () => {
    const textData: any = await chatResponse(`explain ${inputValue} like I'm 10 in 300 words`)

    const { data } = await axios.post("/api/learn", {
      prompt: inputValue
    })

    setResponse({
      image: data.image,
      text: textData as string
    })
  }

  const handleSubmit = async () => {
    setTopic(inputValue)
    setLoading(true)
    fetchQuiz()
    await generateData()
    setLoading(false)
  }
  const handleInputChange = (e: any) => {
    setInputValue(e.target.value)
  }

  const { isOpen, onClose, onOpen } = useDisclosure();

  return (
    <Box p={8}>
      <Head>
        <title>Learn GPT</title>
      </Head>
      <Flex justifyContent="center" alignItems="center" direction='column'>
        <Heading as="h1" size="xl" mb={4}>
          Learn GPT
        </Heading>
        <QuizModal isOpen={isOpen} onClose={onClose} topic={topic} questions={questions} />
        <FormLabel htmlFor="name">What do you want to study today?</FormLabel>
        <Input
          id="name"
          placeholder="Enter a topic"
          value={inputValue}
          onChange={handleInputChange}
          mb={4}
          rounded="none"
          border="2px"
        />
        <Button rounded="none" variant="outline" border="4px" type="submit" onClick={handleSubmit} isLoading={loading}>
          Submit
        </Button>
        {loading && (<>
          <marquee>good things take time</marquee>
        </>)}
        {
          response && (
            <>
              {response.text && <Text p={4} >{response.text}</Text>}
              <br />
              {response.image && <Image src={response.image[0]} alt="Image" width="300px" height="300px" />}
              <Button m={4} rounded="none" isDisabled={typeof questions == "undefined"} variant="outline" border="4px" onClick={onOpen}>
                Take a quiz!
              </Button>
            </>
          )
        }
      </Flex>

    </Box>
  )
}
