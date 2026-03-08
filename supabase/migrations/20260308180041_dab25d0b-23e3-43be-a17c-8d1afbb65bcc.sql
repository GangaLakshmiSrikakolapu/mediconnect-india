-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.hospitals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE public.doctors;