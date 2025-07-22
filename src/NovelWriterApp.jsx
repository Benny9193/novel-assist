import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

export default function NovelWriterApp() {
  const [text, setText] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [history, setHistory] = useState([]);
  const [goal, setGoal] = useState(1000);
  const [title, setTitle] = useState("My Novel");
  const [sceneList, setSceneList] = useState([{ id: 1, name: "Scene 1" }]);
  const [currentScene, setCurrentScene] = useState(1);
  const [sceneText, setSceneText] = useState({ 1: "" });
  const [characters, setCharacters] = useState([]);
  const [worldNotes, setWorldNotes] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const saveData = { title, sceneText, history, goal, characters, worldNotes };
      localStorage.setItem("novel-writer-data", JSON.stringify(saveData));
      setHistory((h) => [...h.slice(-9), { timestamp: new Date(), text: sceneText[currentScene] }]);
    }, 10000);
    return () => clearInterval(interval);
  }, [sceneText, currentScene, title, history, goal, characters, worldNotes]);

  useEffect(() => {
    const saved = localStorage.getItem("novel-writer-data");
    if (saved) {
      const data = JSON.parse(saved);
      setTitle(data.title);
      setSceneText(data.sceneText);
      setHistory(data.history || []);
      setGoal(data.goal || 1000);
      setCharacters(data.characters || []);
      setWorldNotes(data.worldNotes || "");
    }
  }, []);

  useEffect(() => {
    setWordCount((sceneText[currentScene] || "").trim().split(/\s+/).length);
  }, [sceneText, currentScene]);

  const handleSceneChange = (id) => setCurrentScene(id);

  const addScene = () => {
    const newId = sceneList.length + 1;
    setSceneList([...sceneList, { id: newId, name: \`Scene \${newId}\` }]);
    setSceneText((prev) => ({ ...prev, [newId]: "" }));
    setCurrentScene(newId);
  };

  const addCharacter = () => setCharacters([...characters, { name: "", role: "" }]);

  const updateCharacter = (index, key, value) => {
    const updated = [...characters];
    updated[index][key] = value;
    setCharacters(updated);
  };

  return (
    <div className={\`min-h-screen p-4 \${darkMode ? "bg-zinc-900 text-white" : "bg-white text-black"}\`}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-xl font-bold mb-2" />
          <div className="flex items-center gap-2">
            <span>Daily Goal:</span>
            <Input type="number" value={goal} onChange={(e) => setGoal(+e.target.value)} className="w-24" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span>Dark Mode</span>
          <Switch checked={darkMode} onCheckedChange={() => setDarkMode(!darkMode)} />
        </div>
      </div>

      <Tabs defaultValue="editor">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="scenes">Scenes</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="characters">Characters</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="editor">
          <Textarea
            className="w-full h-[60vh] p-4 text-lg border border-gray-300 dark:border-gray-700 rounded-xl resize-none"
            value={sceneText[currentScene] || ""}
            onChange={(e) => setSceneText({ ...sceneText, [currentScene]: e.target.value })}
            placeholder="Start your scene..."
          />
          <motion.div className="mt-4 text-sm text-right" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            Word Count: {wordCount} / {goal} ({Math.round((wordCount / goal) * 100)}%)
          </motion.div>
          <Progress value={Math.min((wordCount / goal) * 100, 100)} className="mt-2" />
        </TabsContent>

        <TabsContent value="scenes">
          <div className="space-y-2">
            {sceneList.map((scene) => (
              <div
                key={scene.id}
                className={\`p-2 rounded-md border cursor-pointer \${currentScene === scene.id ? "bg-blue-100 dark:bg-zinc-800" : "hover:bg-gray-100 dark:hover:bg-zinc-800"}\`}
                onClick={() => handleSceneChange(scene.id)}
              >
                {scene.name}
              </div>
            ))}
            <Button variant="outline" onClick={addScene} className="mt-2">
              + Add Scene
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {history.map((ver, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-2 border rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                <span className="text-sm">{new Date(ver.timestamp).toLocaleTimeString()}</span>
                <Button size="sm" variant="outline" onClick={() => setSceneText({ ...sceneText, [currentScene]: ver.text })}>
                  Restore
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="characters">
          <div className="space-y-4">
            {characters.map((char, i) => (
              <div key={i} className="space-y-2 p-2 border rounded-md">
                <Input
                  placeholder="Character Name"
                  value={char.name}
                  onChange={(e) => updateCharacter(i, "name", e.target.value)}
                />
                <Input
                  placeholder="Role / Notes"
                  value={char.role}
                  onChange={(e) => updateCharacter(i, "role", e.target.value)}
                />
              </div>
            ))}
            <Button onClick={addCharacter} variant="outline">
              + Add Character
            </Button>
            <Textarea
              placeholder="World Notes / Lore / Timeline"
              className="w-full h-40 mt-4"
              value={worldNotes}
              onChange={(e) => setWorldNotes(e.target.value)}
            />
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <div className="p-4 bg-gray-100 dark:bg-zinc-800 rounded-xl max-h-[70vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{title}</h2>
            {sceneList.map((scene) => (
              <div key={scene.id} className="mb-6">
                <h3 className="text-lg font-semibold mb-2">{scene.name}</h3>
                <p className="whitespace-pre-wrap leading-relaxed">
                  {sceneText[scene.id] || "(Empty)"}
                </p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
