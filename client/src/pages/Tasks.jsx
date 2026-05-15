import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { motion } from "framer-motion";
import { LuSearch, LuFilter, LuSquareKanban, LuGripVertical, LuCalendar, LuLock } from "react-icons/lu";
import toast from "react-hot-toast";
import API from "../api/axios";
import useAuth from "../hooks/useAuth";
import Badge from "../components/ui/Badge";
import Loader from "../components/ui/Loader";
import { formatDate, isOverdue, getInitials, cn } from "../utils/helpers";

export default function Tasks() {
  const { isAdmin, user } = useAuth();
  const [tasks, setTasks] = useState({
    "todo": [],
    "in-progress": [],
    "done": []
  });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterProject, setFilterProject] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    Promise.all([API.get("/projects")])
      .then(([projRes]) => {
        setProjects(projRes.data);
        return Promise.all(
          projRes.data.map((p) => API.get(`/tasks/project/${p._id}`))
        );
      })
      .then((taskResults) => {
        let allTasks = taskResults.flatMap((r) => r.data);
        
        // Members only see their own tasks
        if (!isAdmin) {
          allTasks = allTasks.filter(task => 
            task.assignee?._id?.toString() === user?._id?.toString()
          );
        }
        
        // Group tasks by status for dnd
        const grouped = { "todo": [], "in-progress": [], "done": [] };
        allTasks.forEach(task => {
          if (grouped[task.status]) {
            grouped[task.status].push(task);
          }
        });
        setTasks(grouped);
      })
      .catch(() => toast.error("Failed to load tasks"))
      .finally(() => setLoading(false));
  }, [isAdmin, user]);

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Optimistic UI update
    const sourceColumn = [...tasks[source.droppableId]];
    const destColumn = [...tasks[destination.droppableId]];
    
    const [movedTask] = sourceColumn.splice(source.index, 1);
    
    // Authorization check before optimistic update
    const canEdit = isAdmin || movedTask.assignee?._id?.toString() === user?._id?.toString();
    if (!canEdit) {
      toast.error("You don't have permission to move this task");
      return;
    }

    movedTask.status = destination.droppableId;
    destColumn.splice(destination.index, 0, movedTask);

    setTasks({
      ...tasks,
      [source.droppableId]: sourceColumn,
      [destination.droppableId]: destColumn,
    });

    // API Call
    try {
      await API.put(`/tasks/${draggableId}`, { status: destination.droppableId });
      toast.success("Task moved");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
      // Revert could be implemented here on fail
    }
  };

  if (loading) return <Loader />;

  const statusGroups = [
    { key: "todo", label: "To Do", border: "border-t-brand-500", bg: "bg-surface-50 dark:bg-surface-900/40" },
    { key: "in-progress", label: "In Progress", border: "border-t-blue-500", bg: "bg-surface-50 dark:bg-surface-900/40" },
    { key: "done", label: "Done", border: "border-t-emerald-500", bg: "bg-surface-50 dark:bg-surface-900/40" },
  ];

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center shadow-lg shadow-brand-500/20">
            <LuSquareKanban className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-surface-900 dark:text-white leading-tight">Board View</h2>
            <p className="text-xs font-medium text-surface-500 dark:text-surface-400">Drag and drop to manage workflow</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-9 py-2 text-xs"
            />
          </div>
          
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="select-field w-auto py-2 text-xs flex-1 md:flex-none"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban columns via dnd */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex overflow-x-auto pb-4 gap-6 flex-1 items-start snap-x custom-scrollbar">
          {statusGroups.map(({ key, label, border, bg }) => {
            
            // Filter logic
            const columnTasks = tasks[key].filter(t => {
              if (filterProject && t.project?._id !== filterProject) return false;
              if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase()) && !(t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))) return false;
              return true;
            });

            return (
              <div key={key} className={cn("min-w-[320px] max-w-[350px] flex-1 flex flex-col rounded-2xl border border-surface-200 dark:border-surface-800/50 p-4 snap-center h-full max-h-full border-t-4", bg, border)}>
                <div className="flex items-center justify-between mb-4 px-1">
                  <span className="text-sm font-bold text-surface-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    {label}
                  </span>
                  <span className="text-xs font-bold text-surface-500 dark:text-surface-400 bg-surface-200 dark:bg-surface-800 px-2.5 py-0.5 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>

                <Droppable droppableId={key}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn("flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar transition-colors rounded-xl min-h-[150px]", snapshot.isDraggingOver ? "bg-surface-100 dark:bg-surface-800/30" : "")}
                    >
                      {columnTasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-[120px] border-2 border-dashed border-surface-200 dark:border-surface-800 rounded-xl opacity-40">
                          <LuSquareKanban className="w-6 h-6 mb-2" />
                          <p className="text-[10px] font-bold uppercase tracking-widest">Empty</p>
                        </div>
                      ) : (
                        columnTasks.map((task, index) => {
                          const canEdit = isAdmin || task.assignee?._id?.toString() === user?._id?.toString();
                          return (
                            <Draggable key={task._id} draggableId={task._id} index={index} isDragDisabled={!canEdit}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={provided.draggableProps.style}
                                  className={cn(
                                    "bg-white dark:bg-surface-950 p-4 rounded-xl shadow-sm border transition-all duration-200 group relative",
                                    snapshot.isDragging 
                                      ? "border-brand-500 shadow-xl shadow-brand-500/20 rotate-2 z-50 scale-105" 
                                      : "border-surface-200 dark:border-surface-800 hover:border-brand-500/50 hover:shadow-md",
                                    !canEdit && "opacity-80 cursor-not-allowed"
                                  )}
                                >
                                  <div className="flex items-start justify-between mb-2 gap-2">
                                    <h4 className="text-sm font-bold text-surface-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                      {task.title}
                                    </h4>
                                    {canEdit ? (
                                      <LuGripVertical className="w-4 h-4 text-surface-300 dark:text-surface-600 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity" />
                                    ) : (
                                      <LuLock className="w-4 h-4 text-surface-300 dark:text-surface-600" />
                                    )}
                                  </div>
                                  
                                  {task.description && (
                                    <p className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-4 line-clamp-2">
                                      {task.description}
                                    </p>
                                  )}
                                  
                                  <div className="flex items-center justify-between mb-4">
                                    <Badge type="priority" value={task.priority} />
                                    <div className={cn("flex items-center gap-1.5 text-[11px] font-bold px-2 py-1 rounded-md", isOverdue(task.dueDate, task.status) ? "text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-500/10" : "text-surface-500 bg-surface-50 dark:text-surface-400 dark:bg-surface-900/50")}>
                                      <LuCalendar className="w-3 h-3" />
                                      {formatDate(task.dueDate)}
                                    </div>
                                  </div>

                                  {/* Quick Status Update for Members */}
                                  {!isAdmin && canEdit && (
                                    <div className="mb-4">
                                      <select 
                                        value={task.status}
                                        onChange={async (e) => {
                                          const newStatus = e.target.value;
                                          try {
                                            await API.put(`/tasks/${task._id}`, { status: newStatus });
                                            toast.success("Status updated");
                                            window.location.reload(); // Quick refresh to update board
                                          } catch (err) {
                                            toast.error("Update failed");
                                          }
                                        }}
                                        className="w-full py-1.5 px-2 text-[10px] font-bold uppercase tracking-wider bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-lg text-surface-600 dark:text-surface-400 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
                                      >
                                        <option value="todo">To Do</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="done">Done</option>
                                      </select>
                                    </div>
                                  )}
  
                                  <div className="flex items-center justify-between pt-3 border-t border-surface-100 dark:border-surface-800/50">
                                    <Link
                                      to={`/projects/${task.project?._id}`}
                                      className="text-xs font-bold text-surface-400 hover:text-brand-500 transition-colors max-w-[120px] truncate"
                                      title={task.project?.name}
                                    >
                                      {task.project?.name}
                                    </Link>
                                    
                                    <div className="w-6 h-6 rounded-full gradient-brand text-white flex items-center justify-center text-[10px] font-bold shadow-md shadow-brand-500/20" title={task.assignee?.name}>
                                      {getInitials(task.assignee?.name || "?")}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
