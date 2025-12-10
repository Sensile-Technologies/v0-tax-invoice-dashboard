-- Insert 5 demo branches
INSERT INTO public.branches (name, location, manager, phone, email, status)
VALUES 
  ('Nairobi Branch', 'Nairobi, Kenya - Westlands, ABC Place', 'John Kamau', '+254722111222', 'nairobi@flow360.com', 'active'),
  ('Mombasa Branch', 'Mombasa, Kenya - Nyali, Mombasa Road', 'Sarah Wanjiku', '+254733222333', 'mombasa@flow360.com', 'active'),
  ('Kisumu Branch', 'Kisumu, Kenya - Milimani, Oginga Odinga Street', 'David Omondi', '+254744333444', 'kisumu@flow360.com', 'active'),
  ('Nakuru Branch', 'Nakuru, Kenya - CBD, Kenyatta Avenue', 'Grace Njeri', '+254755444555', 'nakuru@flow360.com', 'active'),
  ('Eldoret Branch', 'Eldoret, Kenya - Pioneer, Uganda Road', 'Peter Kipchoge', '+254766555666', 'eldoret@flow360.com', 'active')
ON CONFLICT DO NOTHING;
