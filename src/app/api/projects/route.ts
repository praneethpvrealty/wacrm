import { NextResponse } from "next/server";
import { requireRole, toErrorResponse } from "@/lib/auth/account";
import { POPULAR_PROJECTS } from "@/lib/data/real-estate-data";

// GET /api/projects
// Searches real estate projects from RERA database, falling back to local seed data
export async function GET(request: Request) {
  try {
    const ctx = await requireRole("viewer");
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || searchParams.get("query") || "";
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(Number(limitParam) || 10, 50) : 10;

    interface DbProject {
      name: string;
      sublocality: string | null;
      city: string | null;
      state: string | null;
      address: string | null;
      project_type: string | null;
    }

    let dbProjects: DbProject[] = [];

    if (search.trim()) {
      // Query rera_projects from Supabase
      // Using ilike searches on name or sublocality
      const { data, error } = await ctx.supabase
        .from("rera_projects")
        .select("name, sublocality, city, state, address, project_type")
        .or(`name.ilike.%${search.trim()}%,sublocality.ilike.%${search.trim()}%`)
        .limit(limit);

      if (error) {
        console.error("[GET /api/projects] Database error:", error);
      } else {
        dbProjects = (data as DbProject[]) || [];
      }
    }

    // Merge/format the projects. If we have database results, map them.
    // Otherwise fallback to filtering the static POPULAR_PROJECTS list.
    let results = dbProjects.map(p => ({
      name: p.name,
      sublocality: p.sublocality || "",
      city: p.city || "Bangalore",
      state: p.state || "Karnataka",
      address: p.address || "",
      type: p.project_type || "Flat/ Apartment"
    }));

    if (results.length === 0) {
      // Filter POPULAR_PROJECTS static array
      const term = search.toLowerCase().trim();
      const filteredPopular = term
        ? POPULAR_PROJECTS.filter(p => 
            p.name.toLowerCase().includes(term) || 
            p.sublocality.toLowerCase().includes(term)
          )
        : POPULAR_PROJECTS;
      
      results = filteredPopular.slice(0, limit).map(p => ({
        name: p.name,
        sublocality: p.sublocality,
        city: p.city,
        state: p.state,
        address: p.address,
        type: "Flat/ Apartment"
      }));
    }

    return NextResponse.json(results);
  } catch (err) {
    return toErrorResponse(err);
  }
}
