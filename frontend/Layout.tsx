import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "./components/Shared/ToastContext";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import "./styles/tailwind.css";
import ProjectModal from "./components/Project/ProjectModal";
import NoteModal from "./components/Note/NoteModal";
import AreaModal from "./components/Area/AreaModal";
import TagModal from "./components/Tag/TagModal";
import InboxModal from "./components/Inbox/InboxModal";
import TaskModal from "./components/Task/TaskModal";
import { Note } from "./entities/Note";
import { Area } from "./entities/Area";
import { Tag } from "./entities/Tag";
import { Project } from "./entities/Project";
import { Task } from "./entities/Task";
import { User } from "./entities/User";
import { useStore } from "./store/useStore";
import { fetchNotes, createNote, updateNote } from "./utils/notesService";
import { fetchAreas, createArea, updateArea } from "./utils/areasService";
import { fetchTags, createTag, updateTag } from "./utils/tagsService";
import { fetchProjects, createProject, updateProject } from "./utils/projectsService";
import { createTask, updateTask } from "./utils/tasksService";
import { isAuthError } from "./utils/authUtils";

interface LayoutProps {
  currentUser: User;
  isDarkMode: boolean;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  toggleDarkMode: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({
  currentUser,
  setCurrentUser,
  isDarkMode,
  toggleDarkMode,
  children,
}) => {
  const { t } = useTranslation();
  const { showSuccessToast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [taskModalType, setTaskModalType] = useState<'simplified' | 'full'>('simplified');

  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [newTask, setNewTask] = useState<Task | null>(null);

  const {
    notesStore: {
      notes,
      setNotes,
      setLoading: setNotesLoading,
      setError: setNotesError,
      isLoading: isNotesLoading,
      isError: isNotesError,
    },
    areasStore: {
      areas,
      setAreas,
      setLoading: setAreasLoading,
      setError: setAreasError,
      isLoading: isAreasLoading,
      isError: isAreasError,
    },
    tasksStore: {
      setLoading: setTasksLoading,
      setError: setTasksError,
      isLoading: isTasksLoading,
      isError: isTasksError,
    },
    projectsStore: {
      projects,
      setProjects,
      setLoading: setProjectsLoading,
      setError: setProjectsError,
      isLoading: isProjectsLoading,
      isError: isProjectsError,
    },
    tagsStore: {
      tags,
      setTags,
      setLoading: setTagsLoading,
      setError: setTagsError,
      isLoading: isTagsLoading,
      isError: isTagsError,
    },
  } = useStore();

  const openTaskModal = (type: 'simplified' | 'full' = 'simplified') => {
    setIsTaskModalOpen(true);
    setTaskModalType(type);
  };



  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadNotes = async () => {
    setNotesLoading(true);
    try {
      const notesData = await fetchNotes();
      setNotes(notesData);
    } catch (error) {
      console.error("Error fetching notes:", error);
      setNotesError(true);
    } finally {
      setNotesLoading(false);
    }
  };

  const loadAreas = async () => {
    setAreasLoading(true);
    try {
      const areasData = await fetchAreas();
      setAreas(areasData);
    } catch (error) {
      console.error("Error fetching areas:", error);
      setAreasError(true);
    } finally {
      setAreasLoading(false);
    }
  };

  const loadTags = async () => {
    setTagsLoading(true);
    try {
      const tagsData = await fetchTags();
      setTags(tagsData);
    } catch (error) {
      console.error("Error fetching tags:", error);
      setTagsError(true);
    } finally {
      setTagsLoading(false);
    }
  };

  const loadProjects = async () => {
    setProjectsLoading(true);
    try {
      const projectsData = await fetchProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setProjectsError(true);
    } finally {
      setProjectsLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
    loadAreas();
    loadTags();
    loadProjects();
  }, []);

  const openNoteModal = (note: Note | null = null) => {
    setSelectedNote(note);
    setIsNoteModalOpen(true);
  };

  const closeNoteModal = () => {
    setIsNoteModalOpen(false);
    setSelectedNote(null);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setNewTask(null);
  };

  const openProjectModal = () => {
    setIsProjectModalOpen(true);
  };

  const closeProjectModal = () => {
    setIsProjectModalOpen(false);
  };

  const openAreaModal = (area: Area | null = null) => {
    setSelectedArea(area);
    setIsAreaModalOpen(true);
  };

  const closeAreaModal = () => {
    setIsAreaModalOpen(false);
    setSelectedArea(null);
  };

  const openTagModal = (tag: Tag | null = null) => {
    setSelectedTag(tag);
    setIsTagModalOpen(true);
  };

  const closeTagModal = () => {
    setIsTagModalOpen(false);
    setSelectedTag(null);
  };

  const handleSaveNote = async (noteData: Note) => {
    try {
      if (noteData.id) {
        await updateNote(noteData.id, noteData);
      } else {
        await createNote(noteData);
      }
      loadNotes();
      closeNoteModal();
    } catch (error: any) {
      console.error("Error saving note:", error);
      // Don't close modal if there's an auth error (user will be redirected)
      if (isAuthError(error)) {
        return;
      }
      closeNoteModal();
    }
  };

  const handleSaveTask = async (taskData: Task) => {
    try {
      if (taskData.id) {
        await updateTask(taskData.id, taskData);
        const taskLink = (
          <span>
            {t('task.updated', 'Task')} <a href="/tasks" className="text-green-200 underline hover:text-green-100">{taskData.name}</a> {t('task.updatedSuccessfully', 'updated successfully!')}
          </span>
        );
        showSuccessToast(taskLink);
      } else {
        const createdTask = await createTask(taskData);
        const taskLink = (
          <span>
            {t('task.created', 'Task')} <a href="/tasks" className="text-green-200 underline hover:text-green-100">{createdTask.name}</a> {t('task.createdSuccessfully', 'created successfully!')}
          </span>
        );
        showSuccessToast(taskLink);
      }
      // Don't refetch all tasks here - let individual components handle their own state
      // This prevents unnecessary re-renders and race conditions
      closeTaskModal();
    } catch (error: any) {
      console.error("Error saving task:", error);
      // Don't close modal if there's an auth error (user will be redirected)
      if (isAuthError(error)) {
        return;
      }
      // For other errors, still close the modal but let the error bubble up
      closeTaskModal();
      throw error;
    }
  };

  const handleCreateProject = async (name: string): Promise<Project> => {
    try {
      const newProject = await createProject({
        name,
        active: true,
      });
      return newProject;
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  };

  const handleSaveProject = async (projectData: Project) => {
    try {
      if (projectData.id) {
        await updateProject(projectData.id, projectData);
      } else {
        await createProject(projectData);
      }
      const projectsData = await fetchProjects();
      setProjects(projectsData);
      closeProjectModal();
    } catch (error: any) {
      console.error("Error saving project:", error);
      // Don't close modal if there's an auth error (user will be redirected)
      if (isAuthError(error)) {
        return;
      }
      closeProjectModal();
    }
  };


  const handleSaveArea = async (areaData: Partial<Area>) => {
    try {
      if (areaData.id) {
        await updateArea(areaData.id, areaData);
      } else {
        await createArea(areaData);
      }
      loadAreas();
      closeAreaModal();
    } catch (error: any) {
      console.error("Error saving area:", error);
      // Don't close modal if there's an auth error (user will be redirected)
      if (isAuthError(error)) {
        return;
      }
      closeAreaModal();
    }
  };

  const handleSaveTag = async (tagData: Tag) => {
    try {
      if (tagData.id) {
        await updateTag(tagData.id, tagData);
      } else {
        await createTag(tagData);
      }
      const tagsData = await fetchTags();
      setTags(tagsData);
      closeTagModal();
    } catch (error: any) {
      console.error("Error saving tag:", error);
      // Don't close modal if there's an auth error (user will be redirected)
      if (isAuthError(error)) {
        return;
      }
      closeTagModal();
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        setCurrentUser(null);
      } else {
        console.error('Logout failed:', await response.json());
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const mainContentMarginLeft = isSidebarOpen ? "ml-72" : "ml-0";

  const isLoading =
    isNotesLoading ||
    isAreasLoading ||
    isTasksLoading ||
    isProjectsLoading ||
    isTagsLoading;
  const isError =
    isNotesError ||
    isAreasError ||
    isTasksError ||
    isProjectsError ||
    isTagsError;

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? "dark" : ""}`}>
        <Navbar
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          openTaskModal={openTaskModal}
        />
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          currentUser={currentUser}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          openTaskModal={openTaskModal}
          openProjectModal={openProjectModal}
          openNoteModal={openNoteModal}
          openAreaModal={openAreaModal}
          openTagModal={openTagModal}
          notes={notes}
          areas={areas}
          tags={tags}
        />
        <div
          className={`flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-800 transition-all duration-300 ease-in-out ${mainContentMarginLeft}`}
        >
          <div className="text-xl text-gray-700 dark:text-gray-200">
            {t('common.loading')}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={`min-h-screen ${isDarkMode ? "dark" : ""}`}>
        <Navbar
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          openTaskModal={openTaskModal}
        />
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          currentUser={currentUser}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          openTaskModal={openTaskModal}
          openProjectModal={openProjectModal}
          openNoteModal={openNoteModal}
          openAreaModal={openAreaModal}
          openTagModal={openTagModal}
          notes={notes}
          areas={areas}
          tags={tags}
        />
        <div
          className={`flex-1 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 transition-all duration-300 ease-in-out ${mainContentMarginLeft}`}
        >
          <div className="text-xl text-red-500">{t('errors.somethingWentWrong')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? "dark" : ""}`}>
      <Navbar
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        openTaskModal={openTaskModal}
      />
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        currentUser={currentUser}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        openTaskModal={openTaskModal}
        openProjectModal={openProjectModal}
        openNoteModal={openNoteModal}
        openAreaModal={openAreaModal}
        openTagModal={openTagModal}
        notes={notes}
        areas={areas}
        tags={tags}
      />

      <div
        className={`transition-all duration-300 ease-in-out ${mainContentMarginLeft}`}
      >
        <div className="flex flex-col bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-screen overflow-y-auto">
          <div className="flex-grow py-6 px-2 md:px-6 pt-24">
            <div className="w-full max-w-5xl mx-auto">{children}</div>
          </div>
        </div>
      </div>


      {isTaskModalOpen && (
        taskModalType === 'simplified' ? (
          <InboxModal
            isOpen={isTaskModalOpen}
            onClose={closeTaskModal}
            onSave={handleSaveTask}
          />
        ) : (
          <TaskModal
            isOpen={isTaskModalOpen}
            onClose={closeTaskModal}
            task={{
              name: "",
              status: "not_started",
            }}
            onSave={handleSaveTask}
            onDelete={async () => {}}
            projects={projects}
            onCreateProject={handleCreateProject}
          />
        )
      )}

      {isProjectModalOpen && (
        <ProjectModal
          isOpen={isProjectModalOpen}
          onClose={closeProjectModal}
          onSave={handleSaveProject}
          onDelete={async (projectId) => {
            try {
              const { deleteProject } = await import('./utils/projectsService');
              await deleteProject(projectId);
              loadProjects();
              closeProjectModal();
            } catch (error) {
              console.error('Error deleting project:', error);
            }
          }}
          areas={areas}
        />
      )}

      {isNoteModalOpen && (
        <NoteModal
          isOpen={isNoteModalOpen}
          onClose={closeNoteModal}
          onSave={handleSaveNote}
          onDelete={async (noteId) => {
            try {
              const { deleteNote } = await import('./utils/notesService');
              await deleteNote(noteId);
              loadNotes();
              closeNoteModal();
            } catch (error) {
              console.error('Error deleting note:', error);
            }
          }}
          note={selectedNote}
          projects={projects}
          onCreateProject={handleCreateProject}
        />
      )}

      {isAreaModalOpen && (
        <AreaModal
          isOpen={isAreaModalOpen}
          onClose={closeAreaModal}
          onSave={handleSaveArea}
          area={selectedArea}
        />
      )}

      {isTagModalOpen && (
        <TagModal
          isOpen={isTagModalOpen}
          onClose={closeTagModal}
          onSave={handleSaveTag}
          tag={selectedTag}
        />
      )}
    </div>
  );
};

export default Layout;
